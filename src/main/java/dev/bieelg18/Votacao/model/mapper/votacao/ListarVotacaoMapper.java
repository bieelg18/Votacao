package dev.bieelg18.Votacao.model.mapper.votacao;

import dev.bieelg18.Votacao.model.dto.votacao.ListarVotacaoDTO;
import dev.bieelg18.Votacao.model.entity.votacao.Votacao;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ListarVotacaoMapper {

    ListarVotacaoDTO toDTO(Votacao votacao);

    Votacao toEntity(ListarVotacaoDTO listarVotacaoDTO);

}
