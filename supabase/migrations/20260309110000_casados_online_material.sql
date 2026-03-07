
-- Tópicos (Módulos) do Material Online Casados Para Sempre
CREATE TABLE IF NOT EXISTS public.casados_online_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lições (Aulas) do Material Online Casados Para Sempre
CREATE TABLE IF NOT EXISTS public.casados_online_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.casados_online_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pdf_url TEXT,
  image_url TEXT,
  video_url TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Progresso do Usuário no Material Online
CREATE TABLE IF NOT EXISTS public.casados_online_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.casados_online_lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- RLS
ALTER TABLE public.casados_online_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casados_online_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casados_online_progress ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view topics') THEN
    CREATE POLICY "Anyone can view topics" ON public.casados_online_topics FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage topics') THEN
    CREATE POLICY "Admins can manage topics" ON public.casados_online_topics FOR ALL USING (
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view lessons') THEN
    CREATE POLICY "Anyone can view lessons" ON public.casados_online_lessons FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage lessons') THEN
    CREATE POLICY "Admins can manage lessons" ON public.casados_online_lessons FOR ALL USING (
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own progress') THEN
    CREATE POLICY "Users can manage own progress" ON public.casados_online_progress FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Limpeza para reinserção (opcional durante desenvolvimento)
DELETE FROM public.casados_online_lessons;
DELETE FROM public.casados_online_topics;

-- Inserção de Tópicos
DO $$
DECLARE
  v_top1 UUID;
  v_top2 UUID;
  v_top3 UUID;
  v_top4 UUID;
BEGIN
  -- 1. Módulo Introdução
  INSERT INTO public.casados_online_topics (title, position) 
  VALUES ('Introdução e Fundamentos', 1) 
  RETURNING id INTO v_top1;

  -- 2. Módulo Principal (12 Semanas)
  INSERT INTO public.casados_online_topics (title, position) 
  VALUES ('Curso Principal (12 Semanas)', 2) 
  RETURNING id INTO v_top2;

  -- 3. Módulos Adicionais
  INSERT INTO public.casados_online_topics (title, position) 
  VALUES ('Módulos de Aprofundamento', 3) 
  RETURNING id INTO v_top3;

  -- 4. Conclusão
  INSERT INTO public.casados_online_topics (title, position) 
  VALUES ('Encerramento', 4) 
  RETURNING id INTO v_top4;

  -- LIÇÕES DA INTRODUÇÃO
  INSERT INTO public.casados_online_lessons (topic_id, title, content, position) VALUES
  (v_top1, 'Bem-vindo ao Casados Para Sempre', 'O casamento é o projeto de Deus para a felicidade humana. Investir no seu relacionamento é investir no seu bem-estar emocional e no futuro de sua família.', 1),
  (v_top1, 'O Plano de Deus e o Prefácio', 'Quando nos casamos somos chamados por Deus para a função de marido e de esposa. É a Sua unção que nos capacita a cumprir o chamado. O casamento foi planeado para ser vibrante e dinâmico.', 2),
  (v_top1, 'A Visão: Uma-Só-Carne', 'A visão 2=1 é transformar lares em oásis de paz. Durante este material, você aprenderá conceitos para livrar seu lar de conflitos e adquirir sabedoria espiritual.', 3);

  -- LIÇÕES DO CURSO PRINCIPAL
  INSERT INTO public.casados_online_lessons (topic_id, title, content, position) VALUES
  (v_top2, 'Semana 1: O Poder da Aliança', 'Estudo sobre o significado da Aliança bíblica. Diferença entre contrato e aliança. O plano original de Deus.', 1),
  (v_top2, 'Semana 2: O Poder da 2=1', 'A unidade que gera poder. Como o casal se torna uma só carne no espírito, alma e corpo.', 2),
  (v_top2, 'Semana 3: O Poder do Sinergismo', 'A cooperação mútua onde o resultado final é maior que o esforço individual.', 3),
  (v_top2, 'Semana 4: O Poder de Semear e Colher', 'Princípios de investimento emocional e espiritual no cônjuge.', 4),
  (v_top2, 'Semana 5: O Poder do Perdão', 'Limpando o terreno para o novo crescimento. A importância de liberar o passado.', 5),
  (v_top2, 'Semana 6: O Poder da Fé', 'Caminhando por fé nas promessas bíblicas para a família.', 6),
  (v_top2, 'Semana 7: A Intimidade Espiritual', 'A oração em conjunto e o compartilhamento da vida com Deus.', 7),
  (v_top2, 'Semana 8: O Poder do Acordo', 'A concordância que destrava as bênçãos dos céus sobre o lar.', 8),
  (v_top2, 'Semana 9: A Intimidade Física', 'O sexo como presente de Deus para a celebração da união.', 9),
  (v_top2, 'Semana 10: Batalha Espiritual', 'Protegendo sua família contra os ataques do inimigo.', 10),
  (v_top2, 'Semana 11: Poder da Transformação', 'O agir do Espírito Santo mudando caracteres e situações.', 11),
  (v_top2, 'Semana 12: O Poder de Ser Um', 'A plenitude do plano de Deus manifestada no casal.', 12);

  -- MÓDULOS DE APROFUNDAMENTO
  INSERT INTO public.casados_online_lessons (topic_id, title, content, position) VALUES
  (v_top3, 'Módulo 1: Comunicação Efetiva', 'Elimine distrações, faça contato visual e demonstre interesse genuíno. Aprenda a ouvir sem julgamento e a parafrasear para garantir entendimento.', 1),
  (v_top3, 'Módulo 2: Conexão e Intimidade', 'Cultive o tempo de qualidade. Pequenos gestos diários que constroem uma ponte inquebrável entre o casal.', 2),
  (v_top3, 'Módulo 3: Construindo Confiança', 'A confiança é a base de tudo. Transparência radical e honestidade nos pequenos detalhes.', 3),
  (v_top3, 'Módulo 4: Parceria e Colaboração', 'Trabalhando como um time. Dividindo responsabilidades e sonhos de forma justa e amorosa.', 4),
  (v_top3, 'Módulo 5: Cuidado e Atenção', 'A arte de notar o outro. Palavras de afirmação e atos de serviço que falam ao coração.', 5),
  (v_top3, 'Módulo 6: Aceitação e Compreensão', 'Celebrando as diferenças. Como lidar com as imperfeições com graça e paciência.', 6),
  (v_top3, 'Módulo 7: Crescimento Conjunto', 'Evoluindo juntos. Não fiquem estagnados; busquem novos desafios e aprendizados como casal.', 7),
  (v_top3, 'Módulo 8: Sustentando a Paixão', 'Nutrindo o romance e a espontaneidade. Datas criativas, surpresas e o cultivo da amizade profunda.', 8);

  -- ENCERRAMENTO
  INSERT INTO public.casados_online_lessons (topic_id, title, content, position) VALUES
  (v_top4, 'Conclusão: O Próximo Passo', 'Este material é apenas o começo. Pratique diariamente o que aprendeu aqui. O sucesso do seu casamento depende da sua persistência em aplicar a Palavra de Deus.', 1);
END $$;
