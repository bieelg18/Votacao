package dev.bieelg18.Votacao.repository.votacao;

import dev.bieelg18.Votacao.model.dto.votacao.ListarVotacaoDTO;
import dev.bieelg18.Votacao.model.entity.votacao.Votacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VotacaoRepository extends JpaRepository<Votacao, Integer> {

    @Query("""
            SELECT new dev.bieelg18.Votacao.model.dto.votacao.ListarVotacaoDTO(
                    v.participante.nome,
                    v.participante.fantasia,
                    COUNT(v)
            )
             FROM Votacao v
             GROUP BY v.participante.id, 
                     v.participante.nome,
                     v.participante.fantasia
             ORDER BY COUNT(v) desc
        """)
    List<ListarVotacaoDTO> rankingVotacao();

    boolean existsByParticipanteId(Integer participanteId);

}
