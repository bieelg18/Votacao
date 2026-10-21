package dev.bieelg18.Votacao.model.dto.usuario;

public record ListarAdminDTO(
        Integer id,
        String nome,
        String email,
        String permissao
) {
}
