package dev.bieelg18.Votacao.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final NaoAutenticadoHandler naoAutenticadoHandler;
    private final SemPermissaoHandler semPermissaoHandler;

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    )throws Exception{
        return configuration.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ){
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationProvider authenticationProvider)
        throws Exception{
        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authenticationProvider(authenticationProvider)

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(naoAutenticadoHandler)
                        .accessDeniedHandler(semPermissaoHandler)
                )

                .authorizeHttpRequests(auth -> auth

                        //Arquivos públicos do frontend
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/cadastro.html",
                                "/verificar-email.html",
                                "/principal.html",
                                "/minha-conta.html",
                                "/ranking.html",
                                "/votacao.html",
                                "/painel-admin.html",
                                "/cadastrar-participante.html",
                                "/editar-participante.html",
                                "/excluir-participante.html",
                                "/listar-usuarios.html",
                                "/css/**",
                                "/js/**",
                                "/img/**"
                        )
                        .permitAll()



                        //Rotas que qualquer um pode acessar
                        .requestMatchers(HttpMethod.POST, "/usuario", "/usuario/confirmar-email",
                                "/usuario/reenviar-codigo", "/auth/login")
                        .permitAll()

                        .requestMatchers(HttpMethod.GET, "/swagger-ui/**", "/v3/api-docs/**")
                        .permitAll()

                        //Rotas onde é preciso estar autenticado para acessar
                        .requestMatchers(HttpMethod.POST, "/votacao")
                        .authenticated()

                        .requestMatchers(HttpMethod.GET, "/usuario/me", "/participante", "/votacao")
                        .authenticated()

                        .requestMatchers(HttpMethod.DELETE, "/usuario/excluir-conta")
                        .authenticated()

                        //Rotas onde precisa ser ADMIN para acessar
                        .requestMatchers(HttpMethod.POST, "/participante/admin")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/usuario/admin/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PATCH, "/usuario/admin/**", "/participante/admin/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/usuario/admin/**", "/participante/admin/**")
                        .hasRole("ADMIN")

                        .anyRequest().denyAll()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );
        return http.build();
    }

}
