package dev.bieelg18.Votacao.documentation.usuario;

import dev.bieelg18.Votacao.model.dto.usuario.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface UsuarioControllerDocs {

    @Operation(summary = "Cria um novo usuário no banco de dados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuário criado"),
            @ApiResponse(responseCode = "400", description = "Usuário não criado")
    })
    ResponseEntity<Void> criarUsuario(CriarUsuarioDTO dto);

    @Operation(summary = "Confirma a conta do usuário através do código de confirmação")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Conta confirmada"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
            @ApiResponse(responseCode = "409", description = "E-mail já verificado"),
            @ApiResponse(responseCode = "404", description = "Código de verificação não encontrado"),
            @ApiResponse(responseCode = "400", description = "Código expirado"),
            @ApiResponse(responseCode = "429", description = "Limite de tentativas excedido"),
            @ApiResponse(responseCode = "400", description = "Código de verificação inválido")
    })
    ResponseEntity<Void> confirmarEmail(ConfirmarEmailDTO dto);

    @Operation(summary = "Lista todos os usuários cadastrados e sua respectiva permissão",
    description = "Somente usuários com permissão ADMIN podem acessar este recurso")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista com todos os usuários cadastrados"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não possui permissão para acessar este recurso")
    })
    List<ListarAdminDTO> listarUsuarios();

    @Operation(summary = "Lista os dados do usuário autenticado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Retorna os dados do usuário autenticado"),
            @ApiResponse(responseCode = "404", description = "Usuário autenticado não encontrado")
    })
    ListarUsuarioDTO listarDados(Authentication authentication);

    @Operation(summary = "Exclui a conta do usuário autenticado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Conta excluída"),
            @ApiResponse(responseCode = "404", description = "Usuário autenticado não encontrado")
    })
    String excluirConta(Authentication authentication);

    @Operation(summary = "Deleta um usuário cadastrado",
    description = "Somente usuários com permissão ADMIN podem acessar este recurso")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário deletado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado, exclusão não realizada"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não possui permissão para acessar este recurso")
    })
    String deletarUsuario(Integer id);

    @Operation(summary = "Altera a permissão de um usuário cadastrado",
    description = "Somente usuários com permissão ADMIN podem acessar este recurso")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Permissão alterada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Permissão não alterada, usuário não encontrado"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não possui permissão para acessar este recurso")
    })
    String editarPermissao(EditarPermissaoDTO dto, Integer id);

}
