package dev.bieelg18.Votacao.controller.votacao;

import dev.bieelg18.Votacao.documentation.votacao.VotacaoControllerDocs;
import dev.bieelg18.Votacao.model.dto.votacao.CriarVotacaoDTO;
import dev.bieelg18.Votacao.model.dto.votacao.ListarVotacaoDTO;
import dev.bieelg18.Votacao.service.votacao.VotacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/votacao")
@RequiredArgsConstructor
public class VotacaoController implements VotacaoControllerDocs {

    private final VotacaoService service;

    //Endpoint para votar
    @Override
    @PostMapping
    public String votar(@RequestBody CriarVotacaoDTO dto, Authentication authentication){
        return service.votar(dto, authentication);
    }

    //Endpoint para listar os votos
    @Override
    @GetMapping
    public List<ListarVotacaoDTO> listarVotos(){
        return service.listarVotos();
    }

}
