je dois faire une modale au clic sur "modifier"
dans la modale, on trouve : 
-   la liste des works depuis l'api avec une photo chaque, avec possibilité de supprimer et un bouton "ajouter une photo"
- après "ajouter une photo", on a formulaire d'ajout avec : 
    - image (string($binary)) (avec chargement de fichier)
    - title (string)
    - category (integer($int64)) qui proviennent de l'api
    - bouton valider
    une fois le formulaire validé, il doit être vidé
- après validé, on a la page mise à jour avec le nouveau projet. 
si on a supprimé une photo, elle ne s'affiche plus dans les travaux.


Données existantes :
    dataWorks, allCategories, token, API

Fonctions existantes :
    displayGallery(works), figureWork(work)

Fonctions à créer :
    displayModalGallery(works), modalFigure(work), fillCategorySelect(),
    openModal(), closeModal(), showGalleryView(), showAddView(), resetForm()

─────────────────────────────────────────

Début

AU CLIC sur "modifier"
    ouvrir la modale sur la vue galerie
    afficher dataWorks dans la modale

AU CLIC sur la croix OU sur l'overlay
    fermer la modale
    vider le formulaire

AU CLIC sur une poubelle
    DELETE du work (avec le token)
    SI OK
        retirer le work de dataWorks
        mettre à jour la modale et la galerie
    SINON
        message d'erreur

AU CLIC sur "Ajouter une photo"
    afficher la vue ajout
    remplir le select avec allCategories (sans "Tous")

AU CLIC sur la flèche retour
    revenir à la vue galerie

QUAND une image est choisie
    SI jpg/png ET ≤ 4 Mo
        afficher l'aperçu
    SINON
        message d'erreur

QUAND image + titre + catégorie sont remplis
    activer le bouton Valider

À LA VALIDATION du formulaire
    POST du FormData (avec le token)
    SI OK
        ajouter le nouveau work à dataWorks
        mettre à jour la modale et la galerie
        vider le formulaire
        revenir à la vue galerie
    SINON
        message d'erreur

Fin