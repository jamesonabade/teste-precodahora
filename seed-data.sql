--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: estabelecimentos; Type: TABLE DATA; Schema: public; Owner: precodahora
--

INSERT INTO public.estabelecimentos VALUES (25, 'M25', 'G Barbosa Supermercado', 'Candeias', 'Vitória da Conquista', 'BA', '39346861014464', -14.8671445, -40.8214252, 3, 'Quarta-Feira', 'Carlos Eduardo', 'Igor', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:11.027953+00', 'Av. Olívia Flores, Candeias, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (26, 'M26', 'Pereira Atacado e Varejo (Alto Maron)', 'Alto Maron', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 3, 'Quarta-Feira', 'Carlos Eduardo', 'Igor', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Alto Maron, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (27, 'M27', 'Supermercados BH (Brumado)', 'Ibirapuera', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 3, 'Quinta-Feira', 'Igor', 'Mécia', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Av. Brumado, Ibirapuera, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (28, 'M28', 'Super Mix Supermercado', 'Boa Vista', 'Vitória da Conquista', 'BA', '49707745000184', -14.8381239, -40.8313437, 3, 'Quinta-Feira', 'Igor', 'Mécia', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:08.298515+00', 'Boa Vista, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (29, 'M29', 'Gbom Supermercado', 'Ibirapuera', 'Vitória da Conquista', 'BA', '17392709000182', -14.8436983, -40.8564338, 3, 'Sexta-Feira', 'Mateus', 'Darci', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:09.873035+00', 'Ibirapuera, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (8, 'M8', 'Mercado Teixeira', 'Brasil', 'Vitória da Conquista', 'BA', '20767961000133', -14.9079464, -40.8337241, 1, 'Quinta-Feira', 'Igor', 'Jameson', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 21:02:57.287253+00', 'Bairro Brasil, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (30, 'M30', 'Supermercado Azevedo', 'Urbis VI', 'Vitória da Conquista', 'BA', '34057422000115', -14.8981314, -40.8498354, 3, 'Sexta-Feira', 'Mateus', 'Darci', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:09.899453+00', 'Urbis VI, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (6, 'M6', 'Mercado Eliene', 'Ibirapuera', 'Vitória da Conquista', 'BA', '10411888000109', -14.8387756, -40.8588862, 1, 'Quarta-Feira', 'Carlos Eduardo', 'Jameson', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 20:41:04.313169+00', 'Bairro Ibirapuera, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (31, 'M31', 'Supermercado Jurema', 'Jurema', 'Vitória da Conquista', 'BA', '35229626000159', -14.8641340, -40.8476120, 4, 'Segunda-Feira', 'Mécia', 'Mateus', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:55:10.905483+00', 'Rua Panamá 49, Jurema, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (32, 'M32', 'Supermercado Petybom', 'Primavera', 'Vitória da Conquista', 'BA', '00924667000180', -14.8462782, -40.8443863, 4, 'Segunda-Feira', 'Mécia', 'Mateus', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:55:10.896855+00', 'Primavera, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (33, 'M33', 'Supermercados Petrópolis', 'Cruzeiro', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 4, 'Terça-Feira', 'Darci', 'Carlos Eduardo', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Cruzeiro, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (7, 'M7', 'Santo Antônio Supermercados', 'Candeias', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 1, 'Quinta-Feira', 'Igor', 'Jameson', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 20:41:06.390263+00', 'Av. Olívia Flores, Candeias, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (34, 'M34', 'Supermercados N U (Boulevard)', 'Candeias', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 4, 'Terça-Feira', 'Darci', 'Carlos Eduardo', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Boulevard Shopping, Candeias, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (9, 'M9', 'Supermercado Modelo', 'Alto Maron', 'Vitória da Conquista', 'BA', '13534276000100', -14.8594547, -40.8570327, 1, 'Sexta-Feira', 'Mateus', 'Jameson', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 21:05:06.49055+00', 'Rua Presidente Vargas, Alto Maron, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (10, 'M10', 'Supermercado Esplendor', 'Boa Vista', 'Vitória da Conquista', 'BA', '17863208000137', -14.8745323, -40.8376343, 1, 'Sexta-Feira', 'Mateus', 'Jameson', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 21:05:17.165062+00', 'Rua Guimarães Rosa 290, Boa Vista, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (1, 'M1', 'Atakarejo', 'Candeias', 'Vitória da Conquista', 'BA', '03915392000107', -14.8723281, -40.8561241, 2, 'Segunda-Feira', 'Mécia', 'Mateus', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:09.893761+00', 'Av. Olívia Flores, s/n - Candeias, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (2, 'M2', 'Supermercado São Jorge', 'Henriqueta Prates', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 2, 'Segunda-Feira', 'Mécia', 'Mateus', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Bairro Henriqueta Prates, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (35, 'M35', 'Supermercado Local', 'Vila Serrana', 'Vitória da Conquista', 'BA', '03065441000160', -14.8393491, -40.8800518, 4, 'Quarta-Feira', 'Carlos Eduardo', 'Igor', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:55:10.894085+00', 'Via Local N VL Serrana I 02, Zabelê, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (5, 'M5', 'Mix Mateus', 'Boa Vista', 'Vitória da Conquista', 'BA', '03995515024422', -14.8737612, -40.8442920, 1, 'Quarta-Feira', 'Carlos Eduardo', 'Jameson', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 21:05:17.157727+00', 'Av. Juracy Magalhães, s/n - Boa Vista, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (4, 'M4', 'Mercadinho Deus Dará', 'Alto Maron', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 1, 'Terça-Feira', 'Darci', 'Jameson', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 20:40:59.709201+00', 'Bairro Alto Maron, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (36, 'M36', 'Rondelli Comércio e transporte LTDA', 'Candeias', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 4, 'Quarta-Feira', 'Carlos Eduardo', 'Igor', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Candeias, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (37, 'M37', 'NS Aparecida', 'Brasil', 'Vitória da Conquista', 'BA', '10648477000131', -14.8560409, -40.8604384, 3, 'Quinta-Feira', 'Igor', 'Mécia', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:10.412621+00', 'Bairro Brasil, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (38, 'M38', 'Supermercado Família', 'Felícia', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 3, 'Quinta-Feira', 'Igor', 'Mécia', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Felícia, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (3, 'M3', 'Economart', 'Bateias', 'Vitória da Conquista', 'BA', '28548486001430', -14.8486599, -40.8702987, 1, 'Terça-Feira', 'Darci', 'Jameson', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 21:05:17.161502+00', 'Av. Brumado, 1200 - Bateias, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (39, 'M39', 'S Nossa Senhora', 'Urbis V', 'Vitória da Conquista', 'BA', '12554541000140', -14.8452352, -40.8689015, 3, 'Sexta-Feira', 'Mateus', 'Darci', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:10.409578+00', 'Urbis V, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (11, 'M11', 'Sendas Distribuidora S/A (Assaí Atacadista)', 'Felícia', 'Vitória da Conquista', 'BA', '06057223030380', -14.9021397, -40.8457776, 2, 'Segunda-Feira', 'Mécia', 'Mateus', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:11.01907+00', 'Av. Juracy Magalhães, Felícia, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (40, 'M40', 'Supermercado Nova Economia', 'Centro', 'Vitória da Conquista', 'BA', '06040979000108', -14.8519377, -40.8442631, 3, 'Sexta-Feira', 'Mateus', 'Darci', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:10.430789+00', 'Av. Régis Pacheco 246, Centro, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (14, 'M14', 'Supermercado Central Ipanema', 'Boa Vista', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 2, 'Terça-Feira', 'Darci', 'Carlos Eduardo', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Boa Vista, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (15, 'M15', 'Supermercados BH (Juracy)', 'Boa Vista', 'Vitória da Conquista', 'BA', '04641376049739', -14.8497339, -40.8578369, 2, 'Quarta-Feira', 'Carlos Eduardo', 'Igor', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:11.015107+00', 'Av. Juracy Magalhães, Boa Vista, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (16, 'M16', 'Supermercado Canaã', 'Campinhos', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 2, 'Quarta-Feira', 'Carlos Eduardo', 'Igor', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Campinhos, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (17, 'M17', 'Supermercado Aliança', 'Patagônia', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 2, 'Quinta-Feira', 'Igor', 'Mécia', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Bairro Patagônia, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (18, 'M18', 'Pereira Atacado e Varejo (Boa Vista)', 'Boa Vista', 'Vitória da Conquista', 'BA', '06064046000231', -14.8540732, -40.8418744, 2, 'Quinta-Feira', 'Igor', 'Mécia', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:11.031801+00', 'Av. Juracy Magalhães, Boa Vista, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (19, 'M19', 'Andralmeida LTDA (São Geraldo)', 'Alto Maron', 'Vitória da Conquista', 'BA', '00196901000109', -14.8519486, -40.8316501, 2, 'Sexta-Feira', 'Mateus', 'Darci', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:10.41664+00', 'Av. Presidente Vargas 258, Alto Maron, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (20, 'M20', 'São Miguel Supermercado', 'Espírito Santo', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 2, 'Sexta-Feira', 'Mateus', 'Darci', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Espírito Santo, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (21, 'M21', 'Supermercados BH (Rosa Cruz)', 'Candeias', 'Vitória da Conquista', 'BA', '04641376047795', NULL, NULL, 3, 'Segunda-Feira', 'Mécia', 'Mateus', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Av. Rosa Cruz, 80 - Candeias, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (22, 'M22', 'Supermercados N U (Bairro Brasil)', 'Brasil', 'Vitória da Conquista', 'BA', '44050925000112', -14.8666927, -40.8233016, 3, 'Segunda-Feira', 'Mécia', 'Mateus', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:56:08.307624+00', 'Bairro Brasil, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (23, 'M23', 'Atacadão (Pres. Dutra)', 'Felícia', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 3, 'Terça-Feira', 'Darci', 'Carlos Eduardo', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Rod. Pres. Dutra, Felícia, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (24, 'M24', 'Supermercado São João', 'Guarani', 'Vitória da Conquista', 'BA', '54513151000334', -14.8803694, -40.8646898, 3, 'Terça-Feira', 'Darci', 'Carlos Eduardo', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:55:09.195279+00', 'Bairro Guarani, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (12, 'M12', 'Supermercado Sampaio', 'Guarani', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 2, 'Segunda-Feira', 'Mécia', 'Mateus', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Bairro Guarani, Vitória da Conquista - BA');
INSERT INTO public.estabelecimentos VALUES (13, 'M13', 'Atacadão (Brumado)', 'Bateias', 'Vitória da Conquista', 'BA', NULL, NULL, NULL, 2, 'Terça-Feira', 'Darci', 'Carlos Eduardo', true, '2026-09-17 19:51:26.726547+00', '2026-09-17 19:53:57.593581+00', 'Av. Brumado, Bateias, Vitória da Conquista - BA');


--
-- Data for Name: produtos_catalogo; Type: TABLE DATA; Schema: public; Owner: precodahora
--

INSERT INTO public.produtos_catalogo VALUES (11, '1.3.02.01', 'Frutas 1.3.02', 'Banana Prata (1 kg)', 'Banana da Prata (1 Kg)', NULL, 'TERMO', 'BANANA PRATA', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (94, '1.2.01.01', 'Carnes, Ovos e Embutidos 1.2.01', 'Carne Acém (1 kg)', 'Carne Acém (1 kg)', NULL, 'TERMO', 'CARNE ACÉM', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (47, '1.1.01.01', 'Leite e Derivados 1.1.01', 'Leite Pasteurizado (1 lt)', 'Leite UHT Integral caixa 1L Piracanjuba', '7898215151708', 'GTIN', 'Leite UHT Integral caixa 1L Piracanjuba', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (48, '1.1.01.01', 'Leite e Derivados 1.1.01', 'Leite Pasteurizado (1 lt)', 'Leite UHT Integral caixa 1L Betania', '7898403782387', 'GTIN', 'Leite UHT Integral caixa 1L Betania', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (49, '1.1.01.01', 'Leite e Derivados 1.1.01', 'Leite Pasteurizado (1 lt)', 'Leite UHT Integral caixa 1L Damare', '7898945133203', 'GTIN', 'Leite UHT Integral caixa 1L Damare', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (50, '1.1.01.01', 'Leite e Derivados 1.1.01', 'Leite Pasteurizado (1 lt)', 'Leite Pasteurizado Integral saco tipo C 1L Vitória', '7898168390018', 'GTIN', 'Leite Pasteurizado Integral saco tipo C 1L Vitória', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (51, '1.1.01.01', 'Leite e Derivados 1.1.01', 'Leite Pasteurizado (1 lt)', 'Leite Pasteurizado Integral saco tipo C 1L Conquista', '7897856400091', 'GTIN', 'Leite Pasteurizado Integral saco tipo C 1L Conquista', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (123, '1.1.01.01', 'Leite e Derivados 1.1.01', 'Leite Pasteurizado (1 lt)', 'Leite UHT Integral caixa 1L Piracanjuba', '7898215151708', 'GTIN', 'Leite UHT Integral caixa 1L Piracanjuba', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (124, '1.1.01.01', 'Leite e Derivados 1.1.01', 'Leite Pasteurizado (1 lt)', 'Leite UHT Integral caixa 1L Betania', '7898403782387', 'GTIN', 'Leite UHT Integral caixa 1L Betania', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (125, '1.1.01.01', 'Leite e Derivados 1.1.01', 'Leite Pasteurizado (1 lt)', 'Leite UHT Integral caixa 1L Damare', '7898945133203', 'GTIN', 'Leite UHT Integral caixa 1L Damare', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (126, '1.1.01.01', 'Leite e Derivados 1.1.01', 'Leite Pasteurizado (1 lt)', 'Leite Pasteurizado Integral saco tipo C 1L Vitória', '7898168390018', 'GTIN', 'Leite Pasteurizado Integral saco tipo C 1L Vitória', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (127, '1.1.01.01', 'Leite e Derivados 1.1.01', 'Leite Pasteurizado (1 lt)', 'Leite Pasteurizado Integral saco tipo C 1L Conquista', '7897856400091', 'GTIN', 'Leite Pasteurizado Integral saco tipo C 1L Conquista', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (52, '1.1.01.02', 'Leite e Derivados 1.1.01', 'Queijo Mussarela (150g)', 'Queijo Mussarela 150g Davaca', '7897318572823', 'GTIN', 'Queijo Mussarela 150g Davaca', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (53, '1.1.01.02', 'Leite e Derivados 1.1.01', 'Queijo Mussarela (150g)', 'Queijo Mussarela 150g Sadia', '7891515591939', 'GTIN', 'Queijo Mussarela 150g Sadia', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (54, '1.1.01.02', 'Leite e Derivados 1.1.01', 'Queijo Mussarela (150g)', 'Queijo Mussarela 150g President', '7898955617526', 'GTIN', 'Queijo Mussarela 150g President', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (55, '1.1.01.02', 'Leite e Derivados 1.1.01', 'Queijo Mussarela (150g)', 'Queijo Mussarela 150g Galbani', '7891097105739', 'GTIN', 'Queijo Mussarela 150g Galbani', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (56, '1.1.01.02', 'Leite e Derivados 1.1.01', 'Queijo Mussarela (150g)', 'Queijo Mussarela 150g Piracanjuba', '7898215150282', 'GTIN', 'Queijo Mussarela 150g Piracanjuba', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (128, '1.1.01.02', 'Leite e Derivados 1.1.01', 'Queijo Mussarela (150g)', 'Queijo Mussarela 150g Davaca', '7897318572823', 'GTIN', 'Queijo Mussarela 150g Davaca', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (129, '1.1.01.02', 'Leite e Derivados 1.1.01', 'Queijo Mussarela (150g)', 'Queijo Mussarela 150g Sadia', '7891515591939', 'GTIN', 'Queijo Mussarela 150g Sadia', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (130, '1.1.01.02', 'Leite e Derivados 1.1.01', 'Queijo Mussarela (150g)', 'Queijo Mussarela 150g President', '7898955617526', 'GTIN', 'Queijo Mussarela 150g President', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (131, '1.1.01.02', 'Leite e Derivados 1.1.01', 'Queijo Mussarela (150g)', 'Queijo Mussarela 150g Galbani', '7891097105739', 'GTIN', 'Queijo Mussarela 150g Galbani', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (132, '1.1.01.02', 'Leite e Derivados 1.1.01', 'Queijo Mussarela (150g)', 'Queijo Mussarela 150g Piracanjuba', '7898215150282', 'GTIN', 'Queijo Mussarela 150g Piracanjuba', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (57, '1.1.01.03', 'Leite e Derivados 1.1.01', 'Queijo Prato (150g)', 'Queijo Prato 150g Davaca', '7897318572830', 'GTIN', 'Queijo Prato 150g Davaca', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (58, '1.1.01.03', 'Leite e Derivados 1.1.01', 'Queijo Prato (150g)', 'Queijo Prato 150g Sadia', '7891515592080', 'GTIN', 'Queijo Prato 150g Sadia', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (59, '1.1.01.03', 'Leite e Derivados 1.1.01', 'Queijo Prato (150g)', 'Queijo Prato 150g Galbani', '7891097105739', 'GTIN', 'Queijo Prato 150g Galbani', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (60, '1.1.01.03', 'Leite e Derivados 1.1.01', 'Queijo Prato (150g)', 'Queijo Prato 150g Piracanjuba', '7898215150657', 'GTIN', 'Queijo Prato 150g Piracanjuba', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (61, '1.1.01.03', 'Leite e Derivados 1.1.01', 'Queijo Prato (150g)', 'Queijo Prato 150g President', '7898955617519', 'GTIN', 'Queijo Prato 150g President', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (133, '1.1.01.03', 'Leite e Derivados 1.1.01', 'Queijo Prato (150g)', 'Queijo Prato 150g Davaca', '7897318572830', 'GTIN', 'Queijo Prato 150g Davaca', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (134, '1.1.01.03', 'Leite e Derivados 1.1.01', 'Queijo Prato (150g)', 'Queijo Prato 150g Sadia', '7891515592080', 'GTIN', 'Queijo Prato 150g Sadia', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (135, '1.1.01.03', 'Leite e Derivados 1.1.01', 'Queijo Prato (150g)', 'Queijo Prato 150g Galbani', '7891097105739', 'GTIN', 'Queijo Prato 150g Galbani', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (136, '1.1.01.03', 'Leite e Derivados 1.1.01', 'Queijo Prato (150g)', 'Queijo Prato 150g Piracanjuba', '7898215150657', 'GTIN', 'Queijo Prato 150g Piracanjuba', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (137, '1.1.01.03', 'Leite e Derivados 1.1.01', 'Queijo Prato (150g)', 'Queijo Prato 150g President', '7898955617519', 'GTIN', 'Queijo Prato 150g President', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (62, '1.1.01.04', 'Leite e Derivados 1.1.01', 'Manteiga (500g)', 'Manteiga 500g Davaca', '7897318572816', 'GTIN', 'Manteiga 500g Davaca', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (63, '1.1.01.04', 'Leite e Derivados 1.1.01', 'Manteiga (500g)', 'Manteiga 500g Conleite', '7898129140034', 'GTIN', 'Manteiga 500g Conleite', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (64, '1.1.01.04', 'Leite e Derivados 1.1.01', 'Manteiga (500g)', 'Manteiga 500g Verona', '7897717900135', 'GTIN', 'Manteiga 500g Verona', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (65, '1.1.01.04', 'Leite e Derivados 1.1.01', 'Manteiga (500g)', 'Manteiga 500g Natville', '7898387120083', 'GTIN', 'Manteiga 500g Natville', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (66, '1.1.01.04', 'Leite e Derivados 1.1.01', 'Manteiga (500g)', 'Manteiga 500g Piracanjuba', '7898215151319', 'GTIN', 'Manteiga 500g Piracanjuba', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (138, '1.1.01.04', 'Leite e Derivados 1.1.01', 'Manteiga (500g)', 'Manteiga 500g Davaca', '7897318572816', 'GTIN', 'Manteiga 500g Davaca', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (139, '1.1.01.04', 'Leite e Derivados 1.1.01', 'Manteiga (500g)', 'Manteiga 500g Conleite', '7898129140034', 'GTIN', 'Manteiga 500g Conleite', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (140, '1.1.01.04', 'Leite e Derivados 1.1.01', 'Manteiga (500g)', 'Manteiga 500g Verona', '7897717900135', 'GTIN', 'Manteiga 500g Verona', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (141, '1.1.01.04', 'Leite e Derivados 1.1.01', 'Manteiga (500g)', 'Manteiga 500g Natville', '7898387120083', 'GTIN', 'Manteiga 500g Natville', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (142, '1.1.01.04', 'Leite e Derivados 1.1.01', 'Manteiga (500g)', 'Manteiga 500g Piracanjuba', '7898215151319', 'GTIN', 'Manteiga 500g Piracanjuba', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (28, '1.1.02.01', 'Farinhas e Massas 1.1.02', 'Farinha de Mandioca (1Kg)', 'Farinha de Mandioca Branca 1Kg São João', '7898357410022', 'GTIN', 'Farinha de Mandioca Branca 1Kg São João', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (29, '1.1.02.01', 'Farinhas e Massas 1.1.02', 'Farinha de Mandioca (1Kg)', 'Farinha de Mandioca Branca 1Kg São Miguel', '7898031690030', 'GTIN', 'Farinha de Mandioca Branca 1Kg São Miguel', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (30, '1.1.02.01', 'Farinhas e Massas 1.1.02', 'Farinha de Mandioca (1Kg)', 'Farinha de Mandioca Amarela 1Kg São João', '7898357410015', 'GTIN', 'Farinha de Mandioca Amarela 1Kg São João', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (31, '1.1.02.01', 'Farinhas e Massas 1.1.02', 'Farinha de Mandioca (1Kg)', 'Farinha de Mandioca Amarela 1Kg São Miguel', '7898031690023', 'GTIN', 'Farinha de Mandioca Amarela 1Kg São Miguel', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (104, '1.1.02.01', 'Farinhas e Massas 1.1.02', 'Farinha de Mandioca (1Kg)', 'Farinha de Mandioca Branca 1Kg São João', '7898357410022', 'GTIN', 'Farinha de Mandioca Branca 1Kg São João', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (105, '1.1.02.01', 'Farinhas e Massas 1.1.02', 'Farinha de Mandioca (1Kg)', 'Farinha de Mandioca Branca 1Kg São Miguel', '7898031690030', 'GTIN', 'Farinha de Mandioca Branca 1Kg São Miguel', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (106, '1.1.02.01', 'Farinhas e Massas 1.1.02', 'Farinha de Mandioca (1Kg)', 'Farinha de Mandioca Amarela 1Kg São João', '7898357410015', 'GTIN', 'Farinha de Mandioca Amarela 1Kg São João', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (107, '1.1.02.01', 'Farinhas e Massas 1.1.02', 'Farinha de Mandioca (1Kg)', 'Farinha de Mandioca Amarela 1Kg São Miguel', '7898031690023', 'GTIN', 'Farinha de Mandioca Amarela 1Kg São Miguel', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (32, '1.1.02.02', 'Farinhas e Massas 1.1.02', 'Farinha de Milho (500g)', 'Farinha de Milho 500g Coringa', '7896481130137', 'GTIN', 'Farinha de Milho 500g Coringa', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (33, '1.1.02.02', 'Farinhas e Massas 1.1.02', 'Farinha de Milho (500g)', 'Farinha de Milho 500g Maratá', '7898932426042', 'GTIN', 'Farinha de Milho 500g Maratá', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (34, '1.1.02.02', 'Farinhas e Massas 1.1.02', 'Farinha de Milho (500g)', 'Farinha de Milho 500g Dona Clara', '7896490288775', 'GTIN', 'Farinha de Milho 500g Dona Clara', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (35, '1.1.02.02', 'Farinhas e Massas 1.1.02', 'Farinha de Milho (500g)', 'Farinha de Milho 500g Vitamilho', '7898366930023', 'GTIN', 'Farinha de Milho 500g Vitamilho', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (36, '1.1.02.02', 'Farinhas e Massas 1.1.02', 'Farinha de Milho (500g)', 'Farinha de Milho 500g Bahia', '7898097320018', 'GTIN', 'Farinha de Milho 500g Bahia', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (108, '1.1.02.02', 'Farinhas e Massas 1.1.02', 'Farinha de Milho (500g)', 'Farinha de Milho 500g Coringa', '7896481130137', 'GTIN', 'Farinha de Milho 500g Coringa', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (109, '1.1.02.02', 'Farinhas e Massas 1.1.02', 'Farinha de Milho (500g)', 'Farinha de Milho 500g Maratá', '7898932426042', 'GTIN', 'Farinha de Milho 500g Maratá', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (110, '1.1.02.02', 'Farinhas e Massas 1.1.02', 'Farinha de Milho (500g)', 'Farinha de Milho 500g Dona Clara', '7896490288775', 'GTIN', 'Farinha de Milho 500g Dona Clara', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (111, '1.1.02.02', 'Farinhas e Massas 1.1.02', 'Farinha de Milho (500g)', 'Farinha de Milho 500g Vitamilho', '7898366930023', 'GTIN', 'Farinha de Milho 500g Vitamilho', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (112, '1.1.02.02', 'Farinhas e Massas 1.1.02', 'Farinha de Milho (500g)', 'Farinha de Milho 500g Bahia', '7898097320018', 'GTIN', 'Farinha de Milho 500g Bahia', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (37, '1.1.02.03', 'Farinhas e Massas 1.1.02', 'Macarrão Espaguete (500g)', 'Macarrão Espaguete Ovos 500g Brandini', '7896005213193', 'GTIN', 'Macarrão Espaguete Ovos 500g Brandini', 'UN', 'OVO_UNIDADE', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (38, '1.1.02.03', 'Farinhas e Massas 1.1.02', 'Macarrão Espaguete (500g)', 'Macarrão Espaguete Ovos 500g Dona Benta', '7896005286579', 'GTIN', 'Macarrão Espaguete Ovos 500g Dona Benta', 'UN', 'OVO_UNIDADE', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (39, '1.1.02.03', 'Farinhas e Massas 1.1.02', 'Macarrão Espaguete (500g)', 'Macarrão Espaguete Ovos 500g Santa Amália', '7896021300044', 'GTIN', 'Macarrão Espaguete Ovos 500g Santa Amália', 'UN', 'OVO_UNIDADE', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (40, '1.1.02.03', 'Farinhas e Massas 1.1.02', 'Macarrão Espaguete (500g)', 'Macarrão Espaguete Ovos 500g Paulista', '7896763621001', 'GTIN', 'Macarrão Espaguete Ovos 500g Paulista', 'UN', 'OVO_UNIDADE', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (41, '1.1.02.03', 'Farinhas e Massas 1.1.02', 'Macarrão Espaguete (500g)', 'Macarrão Espaguete Ovos 500g Petybon', '7897721410002', 'GTIN', 'Macarrão Espaguete Ovos 500g Petybon', 'UN', 'OVO_UNIDADE', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (113, '1.1.02.03', 'Farinhas e Massas 1.1.02', 'Macarrão Espaguete (500g)', 'Macarrão Espaguete Ovos 500g Brandini', '7896005213193', 'GTIN', 'Macarrão Espaguete Ovos 500g Brandini', 'UN', 'OVO_UNIDADE', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (114, '1.1.02.03', 'Farinhas e Massas 1.1.02', 'Macarrão Espaguete (500g)', 'Macarrão Espaguete Ovos 500g Dona Benta', '7896005286579', 'GTIN', 'Macarrão Espaguete Ovos 500g Dona Benta', 'UN', 'OVO_UNIDADE', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (115, '1.1.02.03', 'Farinhas e Massas 1.1.02', 'Macarrão Espaguete (500g)', 'Macarrão Espaguete Ovos 500g Santa Amália', '7896021300044', 'GTIN', 'Macarrão Espaguete Ovos 500g Santa Amália', 'UN', 'OVO_UNIDADE', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (116, '1.1.02.03', 'Farinhas e Massas 1.1.02', 'Macarrão Espaguete (500g)', 'Macarrão Espaguete Ovos 500g Paulista', '7896763621001', 'GTIN', 'Macarrão Espaguete Ovos 500g Paulista', 'UN', 'OVO_UNIDADE', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (117, '1.1.02.03', 'Farinhas e Massas 1.1.02', 'Macarrão Espaguete (500g)', 'Macarrão Espaguete Ovos 500g Petybon', '7897721410002', 'GTIN', 'Macarrão Espaguete Ovos 500g Petybon', 'UN', 'OVO_UNIDADE', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (13, '1.1.03.01', 'Café 1.1.03', 'Café (250g)', 'Café Torrado e Moído Tradicional 250g Bahia a Vácuo', '7898017920199', 'GTIN', 'Café Torrado e Moído Tradicional 250g Bahia a Vácuo', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (14, '1.1.03.01', 'Café 1.1.03', 'Café (250g)', 'Café Torrado e Moído Tradicional 250g Pilão a Vácuo', '7896089012637', 'GTIN', 'Café Torrado e Moído Tradicional 250g Pilão a Vácuo', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (15, '1.1.03.01', 'Café 1.1.03', 'Café (250g)', 'Café Torrado e Moído Tradicional 250g 3 Corações a Vácuo', '7896005800362', 'GTIN', 'Café Torrado e Moído Tradicional 250g 3 Corações a Vácuo', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (16, '1.1.03.01', 'Café 1.1.03', 'Café (250g)', 'Café Torrado e Moído Tradicional 250g Mellita a Vácuo', '7891021006071', 'GTIN', 'Café Torrado e Moído Tradicional 250g Mellita a Vácuo', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (17, '1.1.03.01', 'Café 1.1.03', 'Café (250g)', 'Café Torrado e Moído Tradicional 250g Maratá a Vácuo', '7898286200039', 'GTIN', 'Café Torrado e Moído Tradicional 250g Maratá a Vácuo', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (89, '1.1.03.01', 'Café 1.1.03', 'Café (250g)', 'Café Torrado e Moído Tradicional 250g Bahia a Vácuo', '7898017920199', 'GTIN', 'Café Torrado e Moído Tradicional 250g Bahia a Vácuo', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (90, '1.1.03.01', 'Café 1.1.03', 'Café (250g)', 'Café Torrado e Moído Tradicional 250g Pilão a Vácuo', '7896089012637', 'GTIN', 'Café Torrado e Moído Tradicional 250g Pilão a Vácuo', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (91, '1.1.03.01', 'Café 1.1.03', 'Café (250g)', 'Café Torrado e Moído Tradicional 250g 3 Corações a Vácuo', '7896005800362', 'GTIN', 'Café Torrado e Moído Tradicional 250g 3 Corações a Vácuo', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (92, '1.1.03.01', 'Café 1.1.03', 'Café (250g)', 'Café Torrado e Moído Tradicional 250g Mellita a Vácuo', '7891021006071', 'GTIN', 'Café Torrado e Moído Tradicional 250g Mellita a Vácuo', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (93, '1.1.03.01', 'Café 1.1.03', 'Café (250g)', 'Café Torrado e Moído Tradicional 250g Maratá a Vácuo', '7898286200039', 'GTIN', 'Café Torrado e Moído Tradicional 250g Maratá a Vácuo', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (72, '1.1.04.01', 'Pão Francês 1.1.04', 'Pão Francês (1 kg)', 'Pão Francês (1 kg)', NULL, 'TERMO', 'PÃO FRANCÊS', 'KG', 'PAO_KG', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (148, '1.1.04.01', 'Pão Francês 1.1.04', 'Pão Francês (1 kg)', 'Pão Francês (1 kg)', NULL, 'TERMO', 'PÃO FRANCÊS', 'KG', 'PAO_KG', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (1, '1.1.05.01', 'Açúcar 1.1.05', 'Açúcar Cristal (1Kg)', 'Açucar Cristal Vida 1Kg', '7898920795044', 'GTIN', 'Açucar Cristal Vida 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (2, '1.1.05.01', 'Açúcar 1.1.05', 'Açúcar Cristal (1Kg)', 'Açucar Cristal Coceal 1Kg', '7898292530038', 'GTIN', 'Açucar Cristal Coceal 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (3, '1.1.05.01', 'Açúcar 1.1.05', 'Açúcar Cristal (1Kg)', 'Açúcar Cristal Vale Bahia 1Kg', '7898968872011', 'GTIN', 'Açúcar Cristal Vale Bahia 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (4, '1.1.05.01', 'Açúcar 1.1.05', 'Açúcar Cristal (1Kg)', 'Açucar Cristal Dona Mira 1Kg', '7898964714070', 'GTIN', 'Açucar Cristal Dona Mira 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (5, '1.1.05.01', 'Açúcar 1.1.05', 'Açúcar Cristal (1Kg)', 'Açucar Cristal Baiano 1Kg', '7898920795259', 'GTIN', 'Açucar Cristal Baiano 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (77, '1.1.05.01', 'Açúcar 1.1.05', 'Açúcar Cristal (1Kg)', 'Açucar Cristal Vida 1Kg', '7898920795044', 'GTIN', 'Açucar Cristal Vida 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (78, '1.1.05.01', 'Açúcar 1.1.05', 'Açúcar Cristal (1Kg)', 'Açucar Cristal Coceal 1Kg', '7898292530038', 'GTIN', 'Açucar Cristal Coceal 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (79, '1.1.05.01', 'Açúcar 1.1.05', 'Açúcar Cristal (1Kg)', 'Açúcar Cristal Vale Bahia 1Kg', '7898968872011', 'GTIN', 'Açúcar Cristal Vale Bahia 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (80, '1.1.05.01', 'Açúcar 1.1.05', 'Açúcar Cristal (1Kg)', 'Açucar Cristal Dona Mira 1Kg', '7898964714070', 'GTIN', 'Açucar Cristal Dona Mira 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (81, '1.1.05.01', 'Açúcar 1.1.05', 'Açúcar Cristal (1Kg)', 'Açucar Cristal Baiano 1Kg', '7898920795259', 'GTIN', 'Açucar Cristal Baiano 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (67, '1.1.06.01', 'Óleo 1.1.06', 'Óleo de Soja (900 ml)', 'Óleo de Soja 900ml garrafa Soya', '7891107101621', 'GTIN', 'Óleo de Soja 900ml garrafa Soya', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (68, '1.1.06.01', 'Óleo 1.1.06', 'Óleo de Soja (900 ml)', 'Óleo de Soja 900ml garrafa Liza', '7896036090244', 'GTIN', 'Óleo de Soja 900ml garrafa Liza', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (69, '1.1.06.01', 'Óleo 1.1.06', 'Óleo de Soja (900 ml)', 'Óleo de Soja 900ml garrafa Sinhá', '7892300030060', 'GTIN', 'Óleo de Soja 900ml garrafa Sinhá', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (70, '1.1.06.01', 'Óleo 1.1.06', 'Óleo de Soja (900 ml)', 'Óleo de Soja 900ml garrafa Concórdia', '7898247780075', 'GTIN', 'Óleo de Soja 900ml garrafa Concórdia', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (71, '1.1.06.01', 'Óleo 1.1.06', 'Óleo de Soja (900 ml)', 'Óleo de Soja 900ml garrafa Primor', '7891080803673', 'GTIN', 'Óleo de Soja 900ml garrafa Primor', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (143, '1.1.06.01', 'Óleo 1.1.06', 'Óleo de Soja (900 ml)', 'Óleo de Soja 900ml garrafa Soya', '7891107101621', 'GTIN', 'Óleo de Soja 900ml garrafa Soya', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (144, '1.1.06.01', 'Óleo 1.1.06', 'Óleo de Soja (900 ml)', 'Óleo de Soja 900ml garrafa Liza', '7896036090244', 'GTIN', 'Óleo de Soja 900ml garrafa Liza', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (145, '1.1.06.01', 'Óleo 1.1.06', 'Óleo de Soja (900 ml)', 'Óleo de Soja 900ml garrafa Sinhá', '7892300030060', 'GTIN', 'Óleo de Soja 900ml garrafa Sinhá', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (146, '1.1.06.01', 'Óleo 1.1.06', 'Óleo de Soja (900 ml)', 'Óleo de Soja 900ml garrafa Concórdia', '7898247780075', 'GTIN', 'Óleo de Soja 900ml garrafa Concórdia', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (147, '1.1.06.01', 'Óleo 1.1.06', 'Óleo de Soja (900 ml)', 'Óleo de Soja 900ml garrafa Primor', '7891080803673', 'GTIN', 'Óleo de Soja 900ml garrafa Primor', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (18, '1.2.01.01', 'Carnes, Ovos e Embutidos 1.2.01', 'Carne Acém (1 kg)', 'Carne Acém (1 kg)', NULL, 'TERMO', 'CARNE ACÉM', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (19, '1.2.01.02', 'Carnes, Ovos e Embutidos 1.2.01', 'Carne Alcatra (1 kg)', 'Carne Alcatra (1 kg)', NULL, 'TERMO', 'CARNE ALCATRA', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (95, '1.2.01.02', 'Carnes, Ovos e Embutidos 1.2.01', 'Carne Alcatra (1 kg)', 'Carne Alcatra (1 kg)', NULL, 'TERMO', 'CARNE ALCATRA', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (20, '1.2.01.03', 'Carnes, Ovos e Embutidos 1.2.01', 'Charque (1Kg)', 'Charque - Dianteira ou Ponta de Agulha (1Kg)', NULL, 'TERMO', 'CHARQUE', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (96, '1.2.01.03', 'Carnes, Ovos e Embutidos 1.2.01', 'Charque (1Kg)', 'Charque - Dianteira ou Ponta de Agulha (1Kg)', NULL, 'TERMO', 'CHARQUE', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (21, '1.2.01.04', 'Carnes, Ovos e Embutidos 1.2.01', 'Frango Inteiro Congelado (1 kg)', 'Frango Inteiro Congelado (1 kg)', NULL, 'TERMO', 'FRANGO INTEIRO', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (97, '1.2.01.04', 'Carnes, Ovos e Embutidos 1.2.01', 'Frango Inteiro Congelado (1 kg)', 'Frango Inteiro Congelado (1 kg)', NULL, 'TERMO', 'FRANGO INTEIRO', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (23, '1.2.01.05', 'Carnes, Ovos e Embutidos 1.2.01', 'Linguiça Calabresa (400g)', 'Linguiça Calabresa 400g Sadia', '7891515620981', 'GTIN', 'Linguiça Calabresa 400g Sadia', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (24, '1.2.01.05', 'Carnes, Ovos e Embutidos 1.2.01', 'Linguiça Calabresa (400g)', 'Linguiça Calabresa 400g Perdigao', '7891515977511', 'GTIN', 'Linguiça Calabresa 400g Perdigao', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (25, '1.2.01.05', 'Carnes, Ovos e Embutidos 1.2.01', 'Linguiça Calabresa (400g)', 'Linguiça Calabresa 400g Seara', '7894904009862', 'GTIN', 'Linguiça Calabresa 400g Seara', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (26, '1.2.01.05', 'Carnes, Ovos e Embutidos 1.2.01', 'Linguiça Calabresa (400g)', 'Linguiça Calabresa 400g Pamplona', '7896716301271', 'GTIN', 'Linguiça Calabresa 400g Pamplona', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (27, '1.2.01.05', 'Carnes, Ovos e Embutidos 1.2.01', 'Linguiça Calabresa (400g)', 'Linguiça Calabresa 400g Aurora', '7891164005832', 'GTIN', 'Linguiça Calabresa 400g Aurora', 'UN', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (99, '1.2.01.05', 'Carnes, Ovos e Embutidos 1.2.01', 'Linguiça Calabresa (400g)', 'Linguiça Calabresa 400g Sadia', '7891515620981', 'GTIN', 'Linguiça Calabresa 400g Sadia', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (100, '1.2.01.05', 'Carnes, Ovos e Embutidos 1.2.01', 'Linguiça Calabresa (400g)', 'Linguiça Calabresa 400g Perdigao', '7891515977511', 'GTIN', 'Linguiça Calabresa 400g Perdigao', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (101, '1.2.01.05', 'Carnes, Ovos e Embutidos 1.2.01', 'Linguiça Calabresa (400g)', 'Linguiça Calabresa 400g Seara', '7894904009862', 'GTIN', 'Linguiça Calabresa 400g Seara', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (102, '1.2.01.05', 'Carnes, Ovos e Embutidos 1.2.01', 'Linguiça Calabresa (400g)', 'Linguiça Calabresa 400g Pamplona', '7896716301271', 'GTIN', 'Linguiça Calabresa 400g Pamplona', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (103, '1.2.01.05', 'Carnes, Ovos e Embutidos 1.2.01', 'Linguiça Calabresa (400g)', 'Linguiça Calabresa 400g Aurora', '7891164005832', 'GTIN', 'Linguiça Calabresa 400g Aurora', 'UN', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (22, '1.2.01.06', 'Carnes, Ovos e Embutidos 1.2.01', 'Ovos Brancos (Unid.)', 'Ovos Brancos (Unid.)', NULL, 'TERMO', 'OVOS BRANCOS', 'UN', 'OVO_UNIDADE', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (98, '1.2.01.06', 'Carnes, Ovos e Embutidos 1.2.01', 'Ovos Brancos (Unid.)', 'Ovos Brancos (Unid.)', NULL, 'TERMO', 'OVOS BRANCOS', 'UN', 'OVO_UNIDADE', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (42, '1.2.02.01', 'Feijão 1.2.02', 'Feijão Carioca (1 kg)', 'Feijão Carioca 1Kg Vida', '7898920795051', 'GTIN', 'Feijão Carioca 1Kg Vida', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (43, '1.2.02.01', 'Feijão 1.2.02', 'Feijão Carioca (1 kg)', 'Feijão Carioca 1Kg Kicaldo', '7896116900029', 'GTIN', 'Feijão Carioca 1Kg Kicaldo', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (44, '1.2.02.01', 'Feijão 1.2.02', 'Feijão Carioca (1 kg)', 'Feijão Carioca 1Kg Dona Alice', '7898903143015', 'GTIN', 'Feijão Carioca 1Kg Dona Alice', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (45, '1.2.02.01', 'Feijão 1.2.02', 'Feijão Carioca (1 kg)', 'Feijão Carioca 1Kg Padim', '7898902334018', 'GTIN', 'Feijão Carioca 1Kg Padim', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (46, '1.2.02.01', 'Feijão 1.2.02', 'Feijão Carioca (1 kg)', 'Feijão Carioca 1Kg Ki Sabor', '7898930231037', 'GTIN', 'Feijão Carioca 1Kg Ki Sabor', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (118, '1.2.02.01', 'Feijão 1.2.02', 'Feijão Carioca (1 kg)', 'Feijão Carioca 1Kg Vida', '7898920795051', 'GTIN', 'Feijão Carioca 1Kg Vida', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (119, '1.2.02.01', 'Feijão 1.2.02', 'Feijão Carioca (1 kg)', 'Feijão Carioca 1Kg Kicaldo', '7896116900029', 'GTIN', 'Feijão Carioca 1Kg Kicaldo', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (120, '1.2.02.01', 'Feijão 1.2.02', 'Feijão Carioca (1 kg)', 'Feijão Carioca 1Kg Dona Alice', '7898903143015', 'GTIN', 'Feijão Carioca 1Kg Dona Alice', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (121, '1.2.02.01', 'Feijão 1.2.02', 'Feijão Carioca (1 kg)', 'Feijão Carioca 1Kg Padim', '7898902334018', 'GTIN', 'Feijão Carioca 1Kg Padim', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (122, '1.2.02.01', 'Feijão 1.2.02', 'Feijão Carioca (1 kg)', 'Feijão Carioca 1Kg Ki Sabor', '7898930231037', 'GTIN', 'Feijão Carioca 1Kg Ki Sabor', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (6, '1.2.03.01', 'Arroz 1.2.03', 'Arroz Parboilizado (1Kg)', 'Arroz Parboilizado Urbano 1Kg', '7896038306053', 'GTIN', 'Arroz Parboilizado Urbano 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (7, '1.2.03.01', 'Arroz 1.2.03', 'Arroz Parboilizado (1Kg)', 'Arroz Parboilizado Tio João 1Kg', '7893500018469', 'GTIN', 'Arroz Parboilizado Tio João 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (8, '1.2.03.01', 'Arroz 1.2.03', 'Arroz Parboilizado (1Kg)', 'Arroz Parboilizado Fazenda 1Kg', '7896389600107', 'GTIN', 'Arroz Parboilizado Fazenda 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (9, '1.2.03.01', 'Arroz 1.2.03', 'Arroz Parboilizado (1Kg)', 'Arroz Parboilizado Tia Maria 1Kg', '609963230297', 'GTIN', 'Arroz Parboilizado Tia Maria 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (10, '1.2.03.01', 'Arroz 1.2.03', 'Arroz Parboilizado (1Kg)', 'Arroz Parboilizado Camil 1Kg', '7896006716112', 'GTIN', 'Arroz Parboilizado Camil 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (82, '1.2.03.01', 'Arroz 1.2.03', 'Arroz Parboilizado (1Kg)', 'Arroz Parboilizado Urbano 1Kg', '7896038306053', 'GTIN', 'Arroz Parboilizado Urbano 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (83, '1.2.03.01', 'Arroz 1.2.03', 'Arroz Parboilizado (1Kg)', 'Arroz Parboilizado Tio João 1Kg', '7893500018469', 'GTIN', 'Arroz Parboilizado Tio João 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (84, '1.2.03.01', 'Arroz 1.2.03', 'Arroz Parboilizado (1Kg)', 'Arroz Parboilizado Fazenda 1Kg', '7896389600107', 'GTIN', 'Arroz Parboilizado Fazenda 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (85, '1.2.03.01', 'Arroz 1.2.03', 'Arroz Parboilizado (1Kg)', 'Arroz Parboilizado Tia Maria 1Kg', '609963230297', 'GTIN', 'Arroz Parboilizado Tia Maria 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (86, '1.2.03.01', 'Arroz 1.2.03', 'Arroz Parboilizado (1Kg)', 'Arroz Parboilizado Camil 1Kg', '7896006716112', 'GTIN', 'Arroz Parboilizado Camil 1Kg', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (73, '1.3.01.01', 'Tubérculos, Raízes e Legumes 1.3.01', 'Batata Inglesa (1 kg)', 'Tomate (1 kg)', NULL, 'TERMO', 'TOMATE KG', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (149, '1.3.01.01', 'Tubérculos, Raízes e Legumes 1.3.01', 'Batata Inglesa (1 kg)', 'Tomate (1 kg)', NULL, 'TERMO', 'TOMATE KG', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (74, '1.3.01.02', 'Tubérculos, Raízes e Legumes 1.3.01', 'Tomate (1 kg)', 'Cebola Branca (1 Kg)', NULL, 'TERMO', 'CEBOLA BRANCA KG', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (150, '1.3.01.02', 'Tubérculos, Raízes e Legumes 1.3.01', 'Tomate (1 kg)', 'Cebola Branca (1 Kg)', NULL, 'TERMO', 'CEBOLA BRANCA KG', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (75, '1.3.01.03', 'Tubérculos, Raízes e Legumes 1.3.01', 'Cenoura (1 kg)', 'Batata Inglesa (1 Kg)', NULL, 'TERMO', 'BATATA INGLESA KG', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (151, '1.3.01.03', 'Tubérculos, Raízes e Legumes 1.3.01', 'Cenoura (1 kg)', 'Batata Inglesa (1 Kg)', NULL, 'TERMO', 'BATATA INGLESA KG', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (76, '1.3.01.04', 'Tubérculos, Raízes e Legumes 1.3.01', 'Cebola (1 kg)', 'Cenoura Kg', NULL, 'TERMO', 'CENOURA KG', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (152, '1.3.01.04', 'Tubérculos, Raízes e Legumes 1.3.01', 'Cebola (1 kg)', 'Cenoura Kg', NULL, 'TERMO', 'CENOURA KG', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (87, '1.3.02.01', 'Frutas 1.3.02', 'Banana Prata (1 kg)', 'Banana da Prata (1 Kg)', NULL, 'TERMO', 'BANANA PRATA', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');
INSERT INTO public.produtos_catalogo VALUES (12, '1.3.02.02', 'Frutas 1.3.02', 'Laranja (1 kg)', 'Maça Nacional Vermelha (1 Kg)', NULL, 'TERMO', 'MAÇA NACIONAL', 'KG', 'PADRAO', true, '2026-09-17 19:51:26.726547+00');
INSERT INTO public.produtos_catalogo VALUES (88, '1.3.02.02', 'Frutas 1.3.02', 'Laranja (1 kg)', 'Maça Nacional Vermelha (1 Kg)', NULL, 'TERMO', 'MAÇA NACIONAL', 'KG', 'PADRAO', true, '2026-09-17 19:53:57.593581+00');


--
-- Data for Name: historico_medias; Type: TABLE DATA; Schema: public; Owner: precodahora
--

INSERT INTO public.historico_medias VALUES (1, '2026-08', 77, 3.6889, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (2, '2026-08', 78, 3.9092, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (3, '2026-08', 79, 3.6467, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (4, '2026-08', 80, 3.0867, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (5, '2026-08', 81, 3.2171, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (6, '2026-08', 82, 4.9896, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (7, '2026-08', 83, 5.0317, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (8, '2026-08', 84, 4.0850, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (9, '2026-08', 85, 4.1333, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (10, '2026-08', 86, 5.0130, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (11, '2026-08', 87, 5.6996, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (12, '2026-08', 88, 9.2055, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (13, '2026-08', 94, 34.6009, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (14, '2026-08', 95, 48.0789, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (15, '2026-08', 97, 10.9030, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (16, '2026-08', 98, 2.5111, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (17, '2026-08', 99, 13.8043, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (18, '2026-08', 100, 15.3947, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (19, '2026-08', 101, 15.5261, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (20, '2026-08', 102, 16.9800, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (21, '2026-08', 103, 17.9600, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (22, '2026-08', 104, 4.9088, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (23, '2026-08', 105, 9.8856, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (24, '2026-08', 106, 4.9425, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (25, '2026-08', 107, 9.8530, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (26, '2026-08', 108, 2.6076, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (27, '2026-08', 109, 1.8643, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (28, '2026-08', 110, 1.9623, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (29, '2026-08', 111, 1.9291, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (30, '2026-08', 112, 4.0150, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (31, '2026-08', 113, 4.7737, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (32, '2026-08', 114, 4.7631, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (33, '2026-08', 115, 5.6700, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (34, '2026-08', 116, 3.9960, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (35, '2026-08', 118, 9.0115, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (36, '2026-08', 119, 10.6086, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (37, '2026-08', 120, 9.9036, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (38, '2026-08', 121, 9.4350, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (39, '2026-08', 122, 9.5450, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (40, '2026-08', 123, 8.1109, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (41, '2026-08', 124, 6.9596, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (42, '2026-08', 125, 6.4444, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (43, '2026-08', 126, 6.1383, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (44, '2026-08', 127, 6.1638, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (45, '2026-08', 128, 10.4717, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (46, '2026-08', 129, 11.2782, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (47, '2026-08', 130, 12.0990, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (48, '2026-08', 135, 11.9858, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (49, '2026-08', 132, 11.3760, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (50, '2026-08', 133, 10.3343, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (51, '2026-08', 134, 11.2367, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (52, '2026-08', 135, 11.6422, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (53, '2026-08', 136, 11.9238, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (54, '2026-08', 137, 12.5500, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (55, '2026-08', 138, 26.8289, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (56, '2026-08', 139, 27.6562, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (57, '2026-08', 140, 27.8889, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (58, '2026-08', 141, 23.2110, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (59, '2026-08', 142, 29.3883, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (60, '2026-08', 143, 8.5512, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (61, '2026-08', 144, 7.7554, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (62, '2026-08', 145, 7.4900, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (63, '2026-08', 148, 14.2215, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (64, '2026-08', 149, 4.5086, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (65, '2026-08', 150, 5.9684, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (66, '2026-08', 151, 5.8880, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');
INSERT INTO public.historico_medias VALUES (67, '2026-08', 152, 7.8318, NULL, NULL, NULL, '2026-09-17 20:06:01.751828+00');


--
-- Name: estabelecimentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: precodahora
--

SELECT pg_catalog.setval('public.estabelecimentos_id_seq', 80, true);


--
-- Name: historico_medias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: precodahora
--

SELECT pg_catalog.setval('public.historico_medias_id_seq', 67, true);


--
-- Name: produtos_catalogo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: precodahora
--

SELECT pg_catalog.setval('public.produtos_catalogo_id_seq', 152, true);


--
-- PostgreSQL database dump complete
--


