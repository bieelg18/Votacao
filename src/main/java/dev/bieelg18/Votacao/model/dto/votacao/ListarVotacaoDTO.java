package dev.bieelg18.Votacao.model.dto.votacao;

public record ListarVotacaoDTO(
        String nomeParticipante,
        String nomeFantasia,
        Long votos
) {
}
