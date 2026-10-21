package dev.bieelg18.Votacao.model.entity.participante;

import dev.bieelg18.Votacao.model.entity.votacao.Votacao;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "tb_participante")
public class Participante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String fantasia;

    @Column(nullable = false)
    private String url_imagem_fantasia;

    @OneToMany(mappedBy = "participante")
    private List<Votacao> votacoes;

}
