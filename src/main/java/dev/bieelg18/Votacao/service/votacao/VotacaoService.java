package dev.bieelg18.Votacao.service.votacao;

import dev.bieelg18.Votacao.exception.EmailNaoVerificadoException;
import dev.bieelg18.Votacao.exception.JaVotouException;
import dev.bieelg18.Votacao.exception.RecursoNaoEncontradoException;
import dev.bieelg18.Votacao.model.dto.votacao.CriarVotacaoDTO;
import dev.bieelg18.Votacao.model.dto.votacao.ListarVotacaoDTO;
import dev.bieelg18.Votacao.model.entity.participante.Participante;
import dev.bieelg18.Votacao.model.entity.usuario.Usuario;
import dev.bieelg18.Votacao.model.entity.votacao.Votacao;
import dev.bieelg18.Votacao.model.mapper.votacao.CriarVotacaoMapper;
import dev.bieelg18.Votacao.model.mapper.votacao.ListarVotacaoMapper;
import dev.bieelg18.Votacao.repository.participante.ParticipanteRepository;
import dev.bieelg18.Votacao.repository.usuario.UsuarioRepository;
import dev.bieelg18.Votacao.repository.votacao.VotacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VotacaoService {

    private final VotacaoRepository repository;
    private final CriarVotacaoMapper criarVotacaoMapper;
    private final ListarVotacaoMapper listarVotacaoMapper;
    private final UsuarioRepository usuarioRepository;
    private final ParticipanteRepository participanteRepository;

    //Método para votar
    @Transactional
    public String votar(CriarVotacaoDTO dto, Authentication authentication){
        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuário autenticado não encontrado"
                ));
        if (!usuario.isEmailVerificado()){
            throw new EmailNaoVerificadoException(
                    "Não é possível votar pois o e-mail associado a sua conta não foi verificado"
            );
        }
        if (repository.existsByUsuarioId(usuario.getId())){
            throw new JaVotouException(
                    "Não é possível votar mais de uma vez"
            );
        }
        Participante participante = participanteRepository.findById(dto.participanteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Participante com o ID " + dto.participanteId() + " não encontrado"
                ));
        Votacao votacao = new Votacao();
        votacao.setParticipante(participante);
        votacao.setUsuario(usuario);
        repository.save(votacao);
        return "Muito obrigado por votar";
    }

    //Método para listar o ranking da votação
    @Transactional(readOnly = true)
    public List<ListarVotacaoDTO> listarVotos(){
        return repository.rankingVotacao();
    }

}
