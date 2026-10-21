package dev.bieelg18.Votacao.model.mapper.usuario;

import dev.bieelg18.Votacao.model.dto.usuario.EditarPermissaoDTO;
import dev.bieelg18.Votacao.model.entity.usuario.Usuario;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EditarPermissaoMapper {

    EditarPermissaoDTO toDTO(Usuario usuario);

    Usuario toEntity(EditarPermissaoDTO editarPermissaoDTO);

}
