package dev.bieelg18.Votacao.controller.usuario;

import dev.bieelg18.Votacao.documentation.usuario.UsuarioControllerDocs;
import dev.bieelg18.Votacao.model.dto.usuario.*;
import dev.bieelg18.Votacao.service.usuario.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuario")
@RequiredArgsConstructor
public class UsuarioController implements UsuarioControllerDocs {

    private final UsuarioService service;

    //Endpoint para criar um novo usuário
    @Override
    @PostMapping
    public ResponseEntity<Void> criarUsuario(@RequestBody CriarUsuarioDTO dto){

        service.criarUsuario(dto);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    //Endpoint para confirmar o e-mail
    @Override
    @PostMapping("/confirmar-email")
    public ResponseEntity<Void> confirmarEmail(@RequestBody ConfirmarEmailDTO dto){

        service.confirmarEmail(dto);

        return ResponseEntity.noContent().build();

    }

    //Endpoint para reenviar código
    @PostMapping("/reenviar-codigo")
    public ResponseEntity<Void> reenviarCodigo(@RequestBody ReenvioEmailDTO dto){

        service.reenviarCodigo(dto);

        return ResponseEntity.noContent().build();

    }

    //Endpoint para listar todos os usuários cadastrados
    @Override
    @GetMapping("/admin/all")
    public List<ListarAdminDTO> listarUsuarios(){
        return service.listarUsuarios();
    }

    //Endpoint para buscar dados do usuário que estiver logado e autenticado
    @Override
    @GetMapping("/me")
    public ListarUsuarioDTO listarDados(Authentication authentication){
        return service.listarDados(authentication);
    }

    //Endpoint para excluir sua conta
    @Override
    @DeleteMapping("/excluir-conta")
    public String excluirConta(Authentication authentication){
        return service.excluirConta(authentication);
    }

    //Endpoint para ADMIN deletar um usuário
    @Override
    @DeleteMapping("/admin/deletar-usuario/{id}")
    public String deletarUsuario(@PathVariable Integer id){
        return service.deletarUsuario(id);
    }

    //Endpoint para ADMIN alterar a permissão de um usuário já cadastrado
    @Override
    @PatchMapping("/admin/alterar-permissao/{id}")
    public String editarPermissao(@RequestBody EditarPermissaoDTO dto, @PathVariable Integer id){
        return service.editarPermissao(dto, id);
    }

}
