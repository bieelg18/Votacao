package dev.bieelg18.Votacao.model.mapper.participante;

import dev.bieelg18.Votacao.model.dto.participante.ListarParticipanteAdminDTO;
import dev.bieelg18.Votacao.model.entity.participante.Participante;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ListarParticipanteAdminMapper {

    ListarParticipanteAdminDTO toDTO(Participante participante);

    Participante toEntity(ListarParticipanteAdminDTO listarParticipanteAdminDTO);

}
