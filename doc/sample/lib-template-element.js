var kungFig = require( '../../lib/kungFig.js' ) ;
var babel = require( 'babel-tower' ).create() ;

babel.extend( {
    fr: {
        sentences: {
            "Hello ${who}[g:m]!" : "Bonjour ${who}[g:m]!" ,
            "Hello ${who}[g:f]!" : "Bonjour ${who}[g:f]!"
        } ,
        elements: {
            master: { altg: [ 'maitre' , 'maitresse' ] }
        }
    }
} ) ;

// Define the context
var ctx = {
    __babel: babel ,
    
    /*
        Create an element having:
        * a translatable key: master
        * a male gender alternative: master
        * a female gender alternative: mistress
    */
    who: kungFig.TemplateElement.parse( "master[altg:master|mistress]" )
} ;

// Create two templates using the element, the first one use the male version ([g:m])
// the last one use the female version ([g:f])
var template1 = kungFig.Template.create( "Hello ${who}[g:m]!" ) ;
var template2 = kungFig.Template.create( "Hello ${who}[g:f]!" ) ;

// Output "Hello master!"
console.log( template1.get( ctx ) ) ;

// Output "Hello mistress!"
console.log( template2.get( ctx ) ) ;

// Switch to the 'fr' (french) locale
ctx.__babel.setLocale( 'fr' ) ;

// Output "Bonjour maitre!"
console.log( template1.get( ctx ) ) ;

// Output "Bonjour maitress!"
console.log( template2.get( ctx ) ) ;
