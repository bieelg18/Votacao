package dev.bieelg18.Votacao.service.usuario;

import dev.bieelg18.Votacao.exception.*;
import dev.bieelg18.Votacao.model.dto.usuario.*;
import dev.bieelg18.Votacao.model.entity.usuario.CodigoVerificacao;
import dev.bieelg18.Votacao.model.entity.usuario.Permissao;
import dev.bieelg18.Votacao.model.entity.usuario.Usuario;
import dev.bieelg18.Votacao.model.mapper.usuario.*;
import dev.bieelg18.Votacao.repository.usuario.CodigoVerificacaoRepository;
import dev.bieelg18.Votacao.repository.usuario.UsuarioRepository;
import dev.bieelg18.Votacao.repository.votacao.VotacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repository;
    private final CriarUsuarioMapper criarUsuarioMapper;
    private final ListarUsuarioMapper listarUsuarioMapper;
    private final EditarUsuarioMapper editarUsuarioMapper;
    private final ListarAdminMapper listarAdminMapper;
    private final EditarPermissaoMapper editarPermissaoMapper;
    private final PasswordEncoder passwordEncoder;
    private final CodigoVerificacaoService codigoVerificacaoService;
    private final EmailService emailService;
    private final CodigoVerificacaoRepository codigoVerificacaoRepository;
    private final VotacaoRepository votacaoRepository;

    //Método para criar um novo usuário
    @Transactional
    public void criarUsuario(CriarUsuarioDTO criarDTO){

        Usuario usuario = criarUsuarioMapper.toEntity(criarDTO);

        usuario.setPermissao(Permissao.USUARIO);
        usuario.setSenha(passwordEncoder.encode(criarDTO.senha()));
        usuario.setEmailVerificado(false);

        Usuario usuarioSalvo = repository.save(usuario);

        String codigo = codigoVerificacaoService.criarCodigoVerificacao(usuarioSalvo);

        emailService.enviarCodigoVerificacao(usuarioSalvo.getEmail(), codigo);


    }

    //Método para confirmar o e-mail
    @Transactional(noRollbackFor = CodigoInvalidoException.class)
    public void confirmarEmail(ConfirmarEmailDTO dto){

        Usuario usuario = repository.findByEmail(dto.email())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuário não encontrado"
                ));

        if (usuario.isEmailVerificado()){
            throw new EmailJaVerificadoException(
                    "Este e-mail já foi verificado"
            );
        }

        CodigoVerificacao verificacao = codigoVerificacaoRepository
                .findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Código de verificação não encontrado"
                ));

        if (codigoVerificacaoService.codigoExpirado(verificacao.getExpiracao())){
            throw new CodigoInvalidoException(
                    "O código de verificação expirou"
            );
        }

        if (verificacao.getTentativas() >= 5){
            throw new LimiteTentativasException(
                    "limite de tentativas excedido. Solicite um novo código"
            );
        }

        if (!codigoVerificacaoService.validarCodigo(
                dto.codigo(), verificacao.getCodigoHash())){

            verificacao.setTentativas(verificacao.getTentativas() + 1);

            throw new CodigoInvalidoException(
                    "Código de verificação inválido"
            );

        }

        usuario.setEmailVerificado(true);

        codigoVerificacaoRepository.delete(verificacao);

    }

    //Método para reenviar o código de confirmação
    @Transactional
    public void reenviarCodigo(ReenvioEmailDTO dto){

        Optional<Usuario> usuarioOptional = repository.findByEmail(dto.email());

        if (usuarioOptional.isEmpty()){
            return;
        }

        Usuario usuario = usuarioOptional.get();

        if (usuario.isEmailVerificado()){
            return;
        }

        CodigoVerificacao verificacao = codigoVerificacaoRepository
                .findByUsuarioId(usuario.getId())
                .orElse(null);

        if (verificacao != null && verificacao.getUltimoEnvio() != null){

            LocalDateTime proximoEnvio = verificacao.getUltimoEnvio()
                    .plusSeconds(60);

            if (LocalDateTime.now().isBefore(proximoEnvio)){
                return;
            }

        }

        String codigo = codigoVerificacaoService.criarCodigoVerificacao(usuario);

        emailService.enviarCodigoVerificacao(usuario.getEmail(), codigo);

    }

    //Método para listar todos os usuários cadastrados (Somente ADMINs podem acessar este método
    @Transactional(readOnly = true)
    public List<ListarAdminDTO> listarUsuarios(){
        List<Usuario> usuarios = repository.findAll();
        return usuarios.stream()
                .map(listarAdminMapper::toDTO)
                .toList();
    }

    //Método para buscar os dados do usuário que estiver logado e autenticado
    @Transactional(readOnly = true)
    public ListarUsuarioDTO listarDados(Authentication authentication){
        String email = authentication.getName();
        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuário autenticado não encontrado"
                ));

        return listarUsuarioMapper.toDTO(usuario);
    }

    //Método para excluir sua conta
    @Transactional
    public String excluirConta(Authentication authentication){
        String email = authentication.getName();
        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuário autenticado não encontrado"
                ));
        codigoVerificacaoRepository.deleteByUsuarioId(usuario.getId());
        votacaoRepository.deleteByUsuarioId(usuario.getId());
        repository.delete(usuario);
        return  "Conta deletada com sucesso!";
    }

    //Método para o ADMIN excluir uma conta
    @Transactional
    public String deletarUsuario(Integer id){
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuário com o ID " + id + " não encontrado"
                ));
        codigoVerificacaoRepository.deleteByUsuarioId(usuario.getId());
        votacaoRepository.deleteByUsuarioId(usuario.getId());
        repository.delete(usuario);
        return "Usuário deletado!";
    }

    //Método para o ADMIN alterar a permissão de um usuário já cadastrado
    @Transactional
    public String editarPermissao(EditarPermissaoDTO dto, Integer id){
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuário com o ID " + id + " não encontrado"
                ));
        if (dto.permissao() != null){
            usuario.setPermissao(dto.permissao());
        }
        return "Permissão alterada para " + dto.permissao();

    }

}
