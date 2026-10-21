package dev.bieelg18.Votacao.model.mapper.votacao;

import dev.bieelg18.Votacao.model.dto.votacao.CriarVotacaoDTO;
import dev.bieelg18.Votacao.model.entity.votacao.Votacao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CriarVotacaoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "participante", ignore = true)
    Votacao toEntity(CriarVotacaoDTO criarVotacaoDTO);

}
