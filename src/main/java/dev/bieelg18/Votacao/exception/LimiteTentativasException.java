package dev.bieelg18.Votacao.exception;

public class LimiteTentativasException extends RuntimeException{

    public LimiteTentativasException(String mensagem){
        super(mensagem);
    }

}
