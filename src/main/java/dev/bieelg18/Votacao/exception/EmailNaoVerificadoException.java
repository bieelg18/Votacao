package dev.bieelg18.Votacao.exception;

public class EmailNaoVerificadoException extends RuntimeException{

    public EmailNaoVerificadoException(String mensagem){
        super(mensagem);
    }

}
