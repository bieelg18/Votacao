package dev.bieelg18.Votacao.model.mapper.usuario;

import dev.bieelg18.Votacao.model.dto.usuario.ListarUsuarioDTO;
import dev.bieelg18.Votacao.model.entity.usuario.Usuario;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ListarUsuarioMapper {

    ListarUsuarioDTO toDTO(Usuario usuario);

    Usuario toEntity(ListarUsuarioDTO listarUsuarioDTO);

}
