
var kungFig = require( '../../lib/kungFig.js' ) ;
var babel = require( 'babel-tower' ).create() ;

babel.extend( {
	fr: {
		sentences: {
			"Give me ${count} apple${count}[n?|s]!" : "Donne-moi ${count} pomme${count}[n?|s]!"
		}
	}
} ) ;

// Define the context
var ctx = {
	__babel: babel ,
	count: 2
} ;

// Create the template
var template = kungFig.Template.create( "Give me ${count} apple${count}[n?|s]!" ) ;

// Output "Give me 2 apples!"
console.log( template.get( ctx ) ) ;

// Switch to the 'fr' (french) locale
ctx.__babel.setLocale( 'fr' ) ;

// Output "Donne-moi 2 pommes!"
console.log( template.get( ctx ) ) ;
