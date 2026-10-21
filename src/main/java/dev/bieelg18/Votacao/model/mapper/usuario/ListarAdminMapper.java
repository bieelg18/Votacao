package dev.bieelg18.Votacao.model.mapper.usuario;

import dev.bieelg18.Votacao.model.dto.usuario.ListarAdminDTO;
import dev.bieelg18.Votacao.model.entity.usuario.Usuario;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ListarAdminMapper {

    ListarAdminDTO toDTO(Usuario usuario);

    Usuario toEntity(ListarAdminDTO listarAdminDTO);

}
