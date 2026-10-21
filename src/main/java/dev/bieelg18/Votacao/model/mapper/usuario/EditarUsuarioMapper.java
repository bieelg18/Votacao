package dev.bieelg18.Votacao.model.mapper.usuario;

import dev.bieelg18.Votacao.model.dto.usuario.EditarUsuarioDTO;
import dev.bieelg18.Votacao.model.entity.usuario.Usuario;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EditarUsuarioMapper {

    EditarUsuarioDTO toDTO(Usuario usuario);

    Usuario toEntity(EditarUsuarioDTO editarUsuarioDTO);

}
