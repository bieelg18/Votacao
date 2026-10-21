package dev.bieelg18.Votacao.model.mapper.participante;

import dev.bieelg18.Votacao.model.dto.participante.ParticipanteDTO;
import dev.bieelg18.Votacao.model.entity.participante.Participante;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ParticipanteMapper {

    ParticipanteDTO toDTO(Participante participante);

    Participante toEntity(ParticipanteDTO participanteDTO);

}
