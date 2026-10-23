package dev.bieelg18.Votacao.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<String> tratarRecursoNaoEncontrado(
            RecursoNaoEncontradoException e
    ){
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(e.getMessage());
    }

    @ExceptionHandler(CodigoInvalidoException.class)
    public ResponseEntity<String> tratarCodigoInvalido(
            CodigoInvalidoException e
    ){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
    }

    @ExceptionHandler(LimiteTentativasException.class)
    public ResponseEntity<String> tratarLimiteTentativas(
            LimiteTentativasException e
    ){
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(e.getMessage());
    }

    @ExceptionHandler(EmailJaVerificadoException.class)
    public ResponseEntity<String> tratarEmailJaVerificado(
            EmailJaVerificadoException e
    ){
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(e.getMessage());
    }

    @ExceptionHandler(TempoReenvioException.class)
    public ResponseEntity<String> tratarTempoReenvio(
            TempoReenvioException e
    ){
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(e.getMessage());
    }

    @ExceptionHandler(EmailNaoVerificadoException.class)
    public ResponseEntity<String> tratarEmailNaoVerificado(
            EmailNaoVerificadoException e
    ){
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(e.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> tratarCredenciaisInvalidas(
            BadCredentialsException e
    ){
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("E-mail e/ou senha inválidos");
    }

    @ExceptionHandler(ParticipanteComVotosException.class)
    public ResponseEntity<String> tratarParticipanteComVotos(
            ParticipanteComVotosException e
    ){
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(e.getMessage());
    }

    @ExceptionHandler(JaVotouException.class)
    public ResponseEntity<String> tratarJaVotou(
            JaVotouException e
    ){
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(e.getMessage());
    }

}
