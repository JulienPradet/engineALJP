# README
-------

<<<<<<< HEAD
=======
## License

This version of the engineALJP is licensed under the terms of the Open Source GPL 3.0 license.

## Le projet

>>>>>>> 267010cfc997aec604ec50c404e6ee5971650df9
Construction du gameengine pour les jeux made by Aurélie et Julien.
Le but ici est de construire un moteur de jeu qui satisfait nos besoins sans avoir un surplus de fonctionnalités qui ne
seraient jamais utilisées. Ainsi, tout ce qui est propre au moteur de jeu doit se trouver dans le fichier `js/engine/main.js`
et ce qui concerne uniquement le jeu en cours de construction doit se trouver dans `js/game/nomdujeu.js`
Par exemple, si on crée une Map particulière, il va dans le jeu. Si on cree un bloc d'eau, il va dans le jeu. Par contre, si on ajoute
un objet qui permet de controller les mouvements du joueur, il va dans l'engine.

## Unités utilisées
Pour l'instant on fait tout en **pixels**. Il faudra certainement faire des ajustements si on veut être compatible avec tablettes et téléphones.
Pour les angles de rotation, on les stock en **radians**. A l'initialisation on peut faire le calcul pour transformer les degrés en radians, mais dans tout stockage, on les met en radian pour éviter des calculs supplémentaires dans la gestion du canvas.

## Structure des fichiers javascript
On va respecter quelques conventions afin de pouvoir revenir sur les codes l'un de l'autre.

### Utilisations de fonctions javascript
Au début, on va utiliser pas mal de fonctions qui n'auront peut être pas une compatibilité sur les autres navigateurs.
Du coup, ce qu'on va faire, c'est ajouter dans les fichiers functions.txt les noms de chaque fonction javascript utilisée qui n'a pas été définie par nos soins (document.getElementById, Object.create, etc.).
Cela permettra de faire une implémentation de ces fonctions si on veut ajouter une compatibilité à un maximum de navigateurs.

### Conventions d'écriture
On va privilégier les noms de variables respectant ce format : type_NomDeLaVariable
Le type n'est pas forcément un type simple mais peut être une abréviation du nom de la classe utilisée lors de l'instanciation.

### Ajout de modules à l'engine
Pour chaque module on cree un fichier javascript. A terme, on les fusionnera pour n'avoir qu'une seule requête HTTP, mais pour la partie
développement, ce sera plus pratique.
Le fichier de module devra :
  - être nommé de la sorte : mod-nomDuModule.js
  - contenir un entête de documentation qui rappelle ce que doit faire ce module, ses spécificités et ses besoins (par exemple, utilisation d'un autre module, etc.)
  - tous ses attributs devront se situer dans l'objet engineALJP.nomDuModule

### Construire des objets
Chaque objet ou classe devra respecter la norme suivante ([inspiré par ce lien](http://blog.xebia.fr/2013/06/10/javascript-retour-aux-bases-constructeur-prototype-et-heritage/)) :

#### Déclaration

    /* Déclaration de la classe */
    engineALJP.nomDuModule.maClass = function(argConstructeur1, argConstructeur2, ...) {
        var _this = this;
        var variablePrivee = 5;
        this.variablePublique = 6;
        (function() {
            _this.argConstructeur1 = argConstructeur1;
            _this.argConstructeur2 = argConstructeur3;
            ...
        )();
    }

    /* Déclaration des fonctions de la classe si elles ne sont pas définies en surcouche */
    engineALJP.nomDuModule.maClass.prototype.nomFonction = function(arg1, arg2, ...) {
        ...
    };

Ainsi pour déclarer une variable de type maClass, on fait :

    var class_maVariable = new engineALJP.nomDuModule.maClass();
    
Grâce à ca, on peut tester le type de la variable via la fonction instanceof engineALJP.nomDuModule.maClass

De plus, si on objet a besoin d'avoir une fonction différente (ex: update d'un objet canvas), sans passer par de l'héritage, on peut faire directement :

    class_maVariable.nomFonction = function(arg1, arg2) {
        // nouveau corps de fonction
    };

#### Héritage
Afin de simplifier le code, on va utiliser la méthode [Object.create()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
Ainsi, ca nous donne :

    engineALJP.nomDuModule.maClassFille = function() {
        ...
    };

    engineALJP.nomDuModule.maClassFille.prototype = Object.create(engineALJP.nomDuModule.maClass.prototype);
    engineALJP.nomDuModule.maClassFille.prototype.nomFonction2 = function() {
        ...
<<<<<<< HEAD
    };
=======
    };
>>>>>>> 267010cfc997aec604ec50c404e6ee5971650df9
