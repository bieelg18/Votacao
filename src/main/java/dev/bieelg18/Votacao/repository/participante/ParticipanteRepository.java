package dev.bieelg18.Votacao.repository.participante;

import dev.bieelg18.Votacao.model.entity.participante.Participante;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipanteRepository extends JpaRepository<Participante, Integer> {
}
