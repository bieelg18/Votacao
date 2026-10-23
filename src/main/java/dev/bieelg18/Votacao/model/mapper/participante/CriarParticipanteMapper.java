package dev.bieelg18.Votacao.model.mapper.participante;

import dev.bieelg18.Votacao.model.dto.participante.CriarParticipanteDTO;
import dev.bieelg18.Votacao.model.entity.participante.Participante;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CriarParticipanteMapper {

    CriarParticipanteDTO toDTO(Participante participante);

    Participante toEntity(CriarParticipanteDTO criarParticipanteDTO);

}
