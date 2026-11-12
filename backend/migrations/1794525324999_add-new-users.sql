-- Up Migration

INSERT INTO public.users (first_name,last_name,email,password_hash,created_at,updated_at,password_changed_at) VALUES
	 ('Nidhi','Thakkar','nidhi+2@example.com','$argon2id$v=19$m=65536,p=4,t=3$CNgslenAsL5E1OGk5TNLVA$Fd4oMjAbzcmNkf44FXM/LtBvZ62DKmfyKp18Dxpvyno','2026-10-24 21:02:42.982041','2026-10-24 21:02:42.982041',NULL);

-- Down Migration
DELETE FROM public.users WHERE email = 'nidhi+2@example.com';