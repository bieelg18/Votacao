package dev.bieelg18.Votacao.repository.usuario;

import dev.bieelg18.Votacao.model.entity.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmail(String email);

}
