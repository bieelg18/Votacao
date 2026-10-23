package dev.bieelg18.Votacao.service.usuario;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;


    public void enviarCodigoVerificacao(String destinatario, String codigo){

        SimpleMailMessage mensagem = new SimpleMailMessage();

        mensagem.setTo(destinatario);
        mensagem.setSubject("Código de verificação - Halloween do Waltão");
        mensagem.setText(
                "Seu código de verificação é: " + codigo +
                        "\n\nEste código expira em 10 minutos."
        );

        mailSender.send(mensagem);

    }

}
