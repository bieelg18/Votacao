package dev.bieelg18.Votacao.model.dto.usuario;

import dev.bieelg18.Votacao.model.entity.usuario.Permissao;

public record ListarUsuarioDTO(
        String nome,
        String email,
        boolean emailVerificado,
        Permissao permissao
) {
}
