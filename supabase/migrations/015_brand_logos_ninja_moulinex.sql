-- Mise à jour des URLs des logos Ninja et Moulinex
UPDATE brands
SET logo_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9rI2dSzqHXc2BKcBuPpI_nbSHVKLrBNGJug&s'
WHERE slug = 'ninja';

UPDATE brands
SET logo_url = 'https://www.leairfryer.fr/wp-content/uploads/2024/12/Moulinex-logo.png'
WHERE slug = 'moulinex';
