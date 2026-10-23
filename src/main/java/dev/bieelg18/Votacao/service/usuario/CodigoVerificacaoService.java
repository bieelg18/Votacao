package dev.bieelg18.Votacao.service.usuario;

import dev.bieelg18.Votacao.model.entity.usuario.CodigoVerificacao;
import dev.bieelg18.Votacao.model.entity.usuario.Usuario;
import dev.bieelg18.Votacao.repository.usuario.CodigoVerificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CodigoVerificacaoService {

    private final SecureRandom secureRandom = new SecureRandom();
    private final PasswordEncoder passwordEncoder;
    private final CodigoVerificacaoRepository repository;

    public String gerarCodigo(){

        int numero = secureRandom.nextInt(1_000_000);

        return String.format("%06d", numero);

    }

    public String gerarHash(String codigo){
        return passwordEncoder.encode(codigo);
    }


    public boolean validarCodigo(String codigoInformado, String codigoHash){
        return passwordEncoder.matches(codigoInformado, codigoHash);
    }

    public LocalDateTime gerarExpiracao(){
        return LocalDateTime.now().plusMinutes(10);
    }

    public boolean codigoExpirado(LocalDateTime expiracao){
        return !LocalDateTime.now().isBefore(expiracao);
    }

    @Transactional
    public String criarCodigoVerificacao(Usuario usuario){

        String codigo = gerarCodigo();

        CodigoVerificacao verificacao = repository
                .findByUsuarioId(usuario.getId())
                .orElseGet(CodigoVerificacao::new);

        verificacao.setUsuario(usuario);
        verificacao.setCodigoHash(gerarHash(codigo));
        verificacao.setExpiracao(gerarExpiracao());
        verificacao.setTentativas(0);
        verificacao.setUltimoEnvio(LocalDateTime.now());

        repository.save(verificacao);

        return codigo;

    }

}
