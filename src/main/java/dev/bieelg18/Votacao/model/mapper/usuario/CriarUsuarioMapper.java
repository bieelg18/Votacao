package dev.bieelg18.Votacao.model.mapper.usuario;

import dev.bieelg18.Votacao.model.dto.usuario.CriarUsuarioDTO;
import dev.bieelg18.Votacao.model.entity.usuario.Usuario;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CriarUsuarioMapper {

    CriarUsuarioDTO toDTO(Usuario usuario);

    Usuario toEntity(CriarUsuarioDTO criarUsuarioDTO);

}
