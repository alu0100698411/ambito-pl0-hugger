var assert = chai.assert;


suite('Pruebas para el parser', function(){
  test('Asociacion a izquierdas resta', function(){
	var input = "VAR a;\na = -1-2-3.";
	var resultado = pl0.parse(input);
	assert.equal(resultado.statements.type, "ASSIGMENT");
	assert.equal(resultado.statements.right.left.left.value.value, "1");
	

  });

test('Asociacion a izquierdas division', function(){
	var input = "a = 3/2/1.";
	var resultado = pl0.parse(input);
	

  });

  test('If-else', function(){
	var input = "VAR a;\nIF (a<3) THEN a = 2 ELSE a = 3.";
	var resultado = pl0.parse(input);
	assert.equal(resultado.statements.type, "IFELSE");

  }); 
  




  test('While-Do', function(){
	var input = "VAR a;\nWHILE (a != 10) DO a = a+1.";
	var resultado = pl0.parse(input);
	assert.equal(resultado.statements.type, "WHILE");
	

  });

  test('Funcion con parametros', function(){
	var input = "VAR a;\nPROCEDURE funcion(variable);\nBEGIN\nvariable = 1\nEND;\na = 1.";
	var resultado = pl0.parse(input);
	assert.equal(resultado.procedimientos[0].type, "PROCEDURE");
  });

});

suite('Pruebas para el analizador de ambito', function(){

test('Numero equivocado de parametros', function(){
	  assert.throws(function() { scopeAnalysis(pl0.parse("CONST PI = 3.14;\nVAR alto, ancho;\nVAR largo;\nPROCEDURE area(x, y);\nVAR resultado;\nBEGIN\nIF(x != 0) THEN\nresultado = x * y\nELSE\nresultado = 0\nEND;\nPROCEDURE volumen(x,y,z);\nVAR resultado;\nresultado = x * y * z;\nBEGIN\nCALL area(alto, ancho, error);\nCALL volumen(alto, ancho, largo)\nEND.")); }, "Procedure \"area\" expects 2 arguments");

  });
  
test('Pasar a una funcion un parametro sin definir', function(){
	  assert.throws(function() { scopeAnalysis(pl0.parse("CONST PI = 3.14;\nVAR alto, ancho;\nVAR largo;\nPROCEDURE area(x, y);\nVAR resultado;\nBEGIN\nIF(x != 0) THEN\nresultado = x * y\nELSE\nresultado = 0\nEND;\nPROCEDURE volumen(x,y,z);\nVAR resultado;\nresultado = x * y * z;\nBEGIN\nCALL area(alto, error);\nCALL volumen(alto, ancho, largo)\nEND.")); }, "Identifier \"error\" has not being declared and it\'s being used");

  });

test('Parametro sin definir dentro de una funcion', function(){
	  assert.throws(function() { scopeAnalysis(pl0.parse("CONST PI = 3.14;\nVAR alto, ancho;\nVAR largo;\nPROCEDURE area(x, y);\nVAR resultado;\nBEGIN\nIF(x != 0) THEN\nerror = x * y\nELSE\nresultado = 0\nEND;\nPROCEDURE volumen(x,y,z);\nVAR resultado;\nresultado = x * y * z;\nBEGIN\nCALL area(alto, ancho);\nCALL volumen(alto, ancho, largo)\nEND.")); }, "Identifier \"error\" has not being declared and it\'s being used");

  });

});

suite('Pruebas para el plegado de constantes', function(){
  test('Plegado con menos unario  (-)', function(){
	var input = "CONST PI = 3.14;\nVAR a;\nBEGIN\na = -3 + 5\nEND.";
	var resultado = pl0.parse(input);
	scopeAnalysis(resultado);
	constantFoldingGeneral(resultado);
	assert.equal(resultado.statements.statements[0].type, "ASSIGMENT");
	assert.equal(resultado.statements.statements[0].right.type, "NUMBER");
	assert.equal(resultado.statements.statements[0].right.value, "2");
  });

test('Plegado con varios niveles', function(){
	var input = "CONST PI = 3.14;\nVAR a;\nBEGIN\na = -3 + 5 * 2\nEND.";
	var resultado = pl0.parse(input);
	scopeAnalysis(resultado);
	constantFoldingGeneral(resultado);
	assert.equal(resultado.statements.statements[0].type, "ASSIGMENT");
	assert.equal(resultado.statements.statements[0].right.type, "NUMBER");
	assert.equal(resultado.statements.statements[0].right.value, "7");
  });

test('Plegado con constantes', function(){
	var input = "CONST PI = 3.14;\nVAR a;\nBEGIN\na = -PI + 5 * 2\nEND.";
	var resultado = pl0.parse(input);
	scopeAnalysis(resultado);
	constantFoldingGeneral(resultado);
	assert.equal(resultado.statements.statements[0].type, "ASSIGMENT");
	assert.equal(resultado.statements.statements[0].right.type, "NUMBER");
	assert.equal(resultado.statements.statements[0].right.value, "6.859999999999999");
  });

});


suite('Errores', function(){
  test('No poner punto al final', function(){
	  assert.throws(function() { pl0.parse("a = 1 + 1"); }, "Parse error on line 1:\na = 1 + 1\n---------^\nExpecting \'.\', \';\', \',\', \')\', \'END\', \'ELSE\', \'COMPARISON\', \'+\', \'-\', \'*\', \'/\', got \'EOF\'");

  });

  test('if sin then', function(){
	  assert.throws(function() { pl0.parse("if a == 1 call."); }, "Parse error on line 1:\nif a == 1 call.\n---^\nExpecting \'(\', got \'ID\'");

  });

  test('Error lexico', function(){
	assert.throws(function() { pl0.parse("if ??!?? .s"); }, "Lexical error on line 1. Unrecognized text.\nif ??!?? .s\n---^");
  });
});

