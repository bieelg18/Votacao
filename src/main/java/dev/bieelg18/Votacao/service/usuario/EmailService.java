
package dev.bieelg18.Votacao.service.usuario;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class EmailService {

    private final RestClient restClient;


    public EmailService(@Value("${RESEND_API_KEY}") String apiKey) {

        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }


    public void enviarCodigoVerificacao(String destinatario, String codigo) {

        Map<String, Object> email = Map.of(
                "from", "Halloween do Waltão <verificacao@halloweenwaltao.com.br>",
                "to", new String[]{destinatario},
                "subject", "Código de verificação - Halloween do Waltão",
                "text", "Seu código de verificação é: " + codigo
                        + "\n\nEste código expira em 10 minutos."
        );

        restClient.post()
                .uri("/emails")
                .contentType(MediaType.APPLICATION_JSON)
                .body(email)
                .retrieve()
                .toBodilessEntity();
    }
}

