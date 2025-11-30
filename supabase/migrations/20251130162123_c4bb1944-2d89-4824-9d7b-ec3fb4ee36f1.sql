-- Contact Messages System Tables

-- Contact messages (general contact form)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('new', 'read', 'replied', 'archived'))
);

-- Objective inquiries (questions about specific objectives)
CREATE TABLE IF NOT EXISTS public.objective_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  visit_date DATE,
  number_of_people INTEGER,
  status TEXT NOT NULL DEFAULT 'new',
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  read_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_inquiry_status CHECK (status IN ('new', 'read', 'replied', 'archived'))
);

-- Guide booking requests
CREATE TABLE IF NOT EXISTS public.guide_booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  number_of_people INTEGER NOT NULL,
  duration_days INTEGER,
  destinations TEXT[],
  special_requests TEXT,
  budget_range TEXT,
  language_preference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  read_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_booking_status CHECK (status IN ('pending', 'contacted', 'confirmed', 'cancelled', 'completed'))
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objective_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_booking_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_messages
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all contact messages"
  ON public.contact_messages
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for objective_inquiries
CREATE POLICY "Anyone can submit objective inquiries"
  ON public.objective_inquiries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all objective inquiries"
  ON public.objective_inquiries
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update objective inquiries"
  ON public.objective_inquiries
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete objective inquiries"
  ON public.objective_inquiries
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for guide_booking_requests
CREATE POLICY "Anyone can submit booking requests"
  ON public.guide_booking_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all booking requests"
  ON public.guide_booking_requests
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update booking requests"
  ON public.guide_booking_requests
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete booking requests"
  ON public.guide_booking_requests
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Indexes for better performance
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX idx_objective_inquiries_objective_id ON public.objective_inquiries(objective_id);
CREATE INDEX idx_objective_inquiries_status ON public.objective_inquiries(status);
CREATE INDEX idx_guide_booking_requests_guide_id ON public.guide_booking_requests(guide_id);
CREATE INDEX idx_guide_booking_requests_status ON public.guide_booking_requests(status);

-- Triggers for updated_at
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_objective_inquiries_updated_at
  BEFORE UPDATE ON public.objective_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guide_booking_requests_updated_at
  BEFORE UPDATE ON public.guide_booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();