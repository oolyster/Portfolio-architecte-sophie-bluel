une fois connecté, on veut changer le lien "login" par logout" et afficher l'icone d'ajout de travaux. 

Au chargement de la page index.html :

Début
    récupérer le token dans le localStorage

    SI le token existe
        // Mode connecté
        sélectionner le <li id="login-link">
        changer son texte en "logout"
        au clic sur ce <li> :
            supprimer le token du localStorage
            recharger la page (retour au mode visiteur)

        afficher le bandeau "Mode édition"
        afficher le bouton "modifier" (icône + texte) à côté du titre "Mes projets"
        masquer les filtres de catégories

    SINON
        // Mode visiteur
        laisser le texte "login"
        au clic sur ce <li> :
            rediriger vers login.html

        masquer le bandeau "Mode édition"
        masquer le bouton "modifier"
        afficher les filtres
    FIN SI
Fin