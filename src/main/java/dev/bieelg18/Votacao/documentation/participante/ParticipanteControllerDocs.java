package dev.bieelg18.Votacao.documentation.participante;

import dev.bieelg18.Votacao.model.dto.participante.CriarParticipanteDTO;
import dev.bieelg18.Votacao.model.dto.participante.ParticipanteDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.util.List;

public interface ParticipanteControllerDocs {

    @Operation(summary = "Cadastra um novo participante no banco de dados",
    description = "Somente usuários com permissão ADMIN podem acessar este recurso")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Participante cadastrado"),
            @ApiResponse(responseCode = "400", description = "Participante não cadastrado"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não possui permissão para acessar este recurso")
    })
    String cadastrarParticipante(CriarParticipanteDTO dto);

    @Operation(summary = "Lista todos os participantes cadastrados",
    description = "Somente usuários autenticados podem acessar este recurso")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista com todos os participantes cadastrados"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado")
    })
    List<ParticipanteDTO> listarParticipantes();

    @Operation(summary = "Editar dados de um participante já cadastrado",
    description = "Somente usuários com permissão ADMIN podem acessar este recurso")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dados do participante editados com sucesso"),
            @ApiResponse(responseCode = "404", description = "Dados do participante não editados, participante não encontrado"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não possui permissão para acessar este recurso")
    })
    String editarParticipantes(CriarParticipanteDTO dto, Integer id);

    @Operation(summary = "Deleta um participante cadastrado",
    description = "Somente usuários com permissão ADMIN podem acessar este recurso")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Participante deletado"),
            @ApiResponse(responseCode = "404", description = "Exclusão não realizada, participante não encontrado"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não possui permissão para acessar este recurso")
    })
    String deletarParticipante(Integer id);

}
