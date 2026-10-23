package dev.bieelg18.Votacao.service.participante;

import dev.bieelg18.Votacao.exception.ParticipanteComVotosException;
import dev.bieelg18.Votacao.exception.RecursoNaoEncontradoException;
import dev.bieelg18.Votacao.model.dto.participante.CriarParticipanteDTO;
import dev.bieelg18.Votacao.model.dto.participante.ParticipanteDTO;
import dev.bieelg18.Votacao.model.entity.participante.Participante;
import dev.bieelg18.Votacao.model.mapper.participante.CriarParticipanteMapper;
import dev.bieelg18.Votacao.model.mapper.participante.ParticipanteMapper;
import dev.bieelg18.Votacao.repository.participante.ParticipanteRepository;
import dev.bieelg18.Votacao.repository.votacao.VotacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParticipanteService {

    private final ParticipanteMapper participanteMapper;
    private final CriarParticipanteMapper criarParticipanteMapper;
    private final ParticipanteRepository repository;
    private final VotacaoRepository votacaoRepository;

    /**
     * Todos os métodos da service de Participantes só podem ser acessados por usuários com permissão ADMIN, exceto pelo método de listar os participantes para os usuários
     * Esse acesso está sendo filtrado na SecurityConfig no método securityFilterChain
     */

    //Método para cadastrar um novo participante
    @Transactional
    public String cadastrarParticipante(CriarParticipanteDTO dto){
        Participante participante = criarParticipanteMapper.toEntity(dto);
        repository.save(participante);
        return  "Participante cadastrado com sucesso!";
    }

    //Método para listar todos os participantes para os usuários
    @Transactional(readOnly = true)
    public List<ParticipanteDTO> listarParticipantes(){
        List<Participante> participantes = repository.findAll();
        return participantes.stream()
                .map(participanteMapper::toDTO)
                .toList();
    }

    //Método para editar os dados dos participantes
    @Transactional
    public String editarParticipante(CriarParticipanteDTO dto, Integer id){
        Participante participante = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Participante com o ID " + id + " não encontrado"
                ));
        if (dto.nome() != null){
            participante.setNome(dto.nome());
        }
        if (dto.fantasia() != null){
            participante.setFantasia(dto.fantasia());
        }
        if (dto.url_imagem_fantasia() != null){
            participante.setUrl_imagem_fantasia(dto.url_imagem_fantasia());
        }
        return "Dados editados com sucesso!";
    }

    //Método para excluir um participante
    @Transactional
    public String deletarParticipante(Integer id){
        Participante participante = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Participante com o ID " + id + " não encontrado"
                ));

        if (votacaoRepository.existsByParticipanteId(id)){
            throw new ParticipanteComVotosException(
                    "Não é possível excluir um participante que já recebeu votos"
            );
        }

        repository.delete(participante);
        return "Participante deletado com sucesso!";
    }

}
