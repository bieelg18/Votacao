package dev.bieelg18.Votacao.repository.usuario;

import dev.bieelg18.Votacao.model.entity.usuario.CodigoVerificacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodigoVerificacaoRepository extends JpaRepository<CodigoVerificacao, Integer> {

    Optional<CodigoVerificacao> findByUsuarioId(Integer usuarioId);

    void deleteByUsuarioId(Integer usuarioId);

}
