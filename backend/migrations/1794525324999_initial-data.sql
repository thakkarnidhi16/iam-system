-- Up Migration

INSERT INTO public.permissions (id,"name",description,created_at) VALUES
	 (1,'view_users','Can view the user list','2026-10-24 17:19:29.195454-04'),
	 (2,'create_users','Can create new users','2026-10-24 17:19:29.195454-04'),
	 (3,'update_users','Can edit users','2026-10-24 17:19:29.195454-04'),
	 (4,'delete_users','Can delete users','2026-10-24 17:19:29.195454-04'),
	 (5,'assign_roles','Can assign roles to users','2026-10-24 17:19:29.195454-04'),
	 (6,'assign_permissions','Can change permissions of roles','2026-10-24 17:19:29.195454-04'),
	 (7,'view_roles','Can view roles','2026-10-24 17:19:29.195454-04');

INSERT INTO public.roles (id,"name",description,created_at) VALUES
	 (1,'admin','Full access to everything','2026-10-24 17:17:42.519383-04'),
	 (2,'viewer','Read-only access','2026-10-24 17:17:42.519383-04');


INSERT INTO public.role_permissions (role_id,permission_id) VALUES
	 (1,1),
	 (1,2),
	 (1,3),
	 (1,4),
	 (1,5),
	 (1,6),
	 (1,7),
	 (2,1),
	 (2,7);


INSERT INTO public.users (id, first_name,last_name,email,password_hash,created_at,updated_at,password_changed_at) VALUES
	 (1, 'Nidhi','Thakkar','nidhi@example.com','$argon2id$v=19$m=65536,p=4,t=3$RrR6M3cGyBlXXa49z79sOQ$5dfLsDyjBqX/KB+cZzdWJfh0FiKmtzbAOW3LyVp/ne4','2026-10-24 21:02:42.982041','2026-10-24 21:02:42.982041',NULL);

INSERT INTO public.user_roles(user_id, role_id) VALUES (1, 1);

-- Down Migration
DELETE FROM public.user_roles WHERE user_id = 1;
DELETE FROM public.users WHERE email = 'nidhi@example.com';
DELETE FROM public.role_permissions;
DELETE FROM public.roles;
DELETE FROM public.permissions;