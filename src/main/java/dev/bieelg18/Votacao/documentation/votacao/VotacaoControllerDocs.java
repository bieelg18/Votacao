package dev.bieelg18.Votacao.documentation.votacao;

import dev.bieelg18.Votacao.model.dto.votacao.CriarVotacaoDTO;
import dev.bieelg18.Votacao.model.dto.votacao.ListarVotacaoDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface VotacaoControllerDocs {

    @Operation(summary = "Cria um voto atrelado ao usuário autenticado",
    description = "Somente usuários autenticados podem acessar este recurso")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Voto criado"),
            @ApiResponse(responseCode = "400", description = "Voto não criado"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Usuário autenticado não encontrado"),
            @ApiResponse(responseCode = "403", description = "Não é possível votar pois o e-mail associado ao usuário não foi confirmado"),
            @ApiResponse(responseCode = "409", description = "Voto não criado, só é possível votar uma vez"),
            @ApiResponse(responseCode = "404", description = "Voto não criado, participante não encontrado")
    })
    String votar(CriarVotacaoDTO dto, Authentication authentication);

    @Operation(summary = "Lista os votos já realizados em ordem decrescente",
    description = "Somente usuários autenticados podem acessar este recurso")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista com os votos em ordem decrescente"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado")
    })
    List<ListarVotacaoDTO> listarVotos();

}
