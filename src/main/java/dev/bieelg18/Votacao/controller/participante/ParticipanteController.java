package dev.bieelg18.Votacao.controller.participante;

import dev.bieelg18.Votacao.documentation.participante.ParticipanteControllerDocs;
import dev.bieelg18.Votacao.model.dto.participante.CriarParticipanteDTO;
import dev.bieelg18.Votacao.model.dto.participante.ParticipanteDTO;
import dev.bieelg18.Votacao.service.participante.ParticipanteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/participante")
@RequiredArgsConstructor
public class ParticipanteController implements ParticipanteControllerDocs {

    private final ParticipanteService service;


    //Endpoint para cadastrar um novo participante
    @Override
    @PostMapping("/admin")
    public String cadastrarParticipante(@RequestBody CriarParticipanteDTO dto){
        return service.cadastrarParticipante(dto);
    }

    //Endpoint para listar todos os participantes
    @Override
    @GetMapping
    public List<ParticipanteDTO> listarParticipantes(){
        return service.listarParticipantes();
    }

    //Endpoint para editar dados dos participantes
    @Override
    @PatchMapping("/admin/{id}")
    public String editarParticipantes(@RequestBody CriarParticipanteDTO dto, @PathVariable Integer id){
        return service.editarParticipante(dto, id);
    }

    //Endpoint para excluir um participante
    @Override
    @DeleteMapping("/admin/{id}")
    public String deletarParticipante(@PathVariable Integer id){
        return service.deletarParticipante(id);
    }

}
