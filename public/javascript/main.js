$(document).ready(function() {
  $('#parse').click(function() {
    editor = $(".CodeMirror")[0].CodeMirror
    var t;
    /*var t1;
    var t2;*/
    try {
      t = pl0.parse(editor.getValue());
      $('#output').html(JSON.stringify(t,undefined,2));
     // t1 = scopeAnalysis(t);
     // t2 = constantFolding(t1);
	constantFoldingGeneral(scopeAnalysis(t));
      $('#ambit').html(JSON.stringify(t,undefined,2));

      $( '#salida').removeClass( "divdoble hidden" ).addClass( "divdoble unhidden" );
      $( '#error').removeClass( "unhidden" ).addClass( "hidden" );
    } catch (e) {
      $( '#error').removeClass( "hidden" ).addClass( "unhidden" );
      $( '#salida').removeClass( "divdoble unhidden" ).addClass( "divdoble hidden" );
      $('#error').html('<pre>\n' + String(e) + '\n</pre>');
    }
  });
  $('#wipe').click(function() {
    editor = $(".CodeMirror")[0].CodeMirror
    editor.setValue("");
	    
  });
  $("#examples").change(function(ev) {
    var f = ev.target.files[0]; 
    var r = new FileReader();
    r.onload = function(e) { 
      var contents = e.target.result;
      editor = $(".CodeMirror")[0].CodeMirror    
      editor.setValue(contents);
    }
    r.readAsText(f);
  });

});


var symbolTableActual;

var cambio = false;
function constantFoldingGeneral(node){

do{
cambio = false;
constantFolding(node);
}while(cambio == true);

}

function constantFolding(node){
	if (!node) return;

	if(node.hasOwnProperty("symbolTable") && node.symbolTable !== undefined){
				symbolTableActual = node.symbolTable; 
	}

	switch (node.type){
		case "BLOCK": 
			if(node.hasOwnProperty("procedimientos") && node.procedimientos !== undefined){
				for (var i in node.procedimientos){
					constantFolding(node.procedimientos[i]);
				}
			}

			if(node.hasOwnProperty("statements") && node.statements !== undefined){
					constantFolding(node.statements);
			}

		break;
		case "PROCEDURE":					
			if(node.block.hasOwnProperty("procedimientos") && node.block.procedimientos !== undefined){
				for (var i in node.block.procedimientos){
					constantFolding(node.block.procedimientos[i]);
				}
			}
			if(node.block.hasOwnProperty("statements") && node.block.statements !== undefined){ 
							constantFolding(node.block.statements);
			}	
	
			break;	
		case "ASSIGMENT":	
			constantFolding(node.right);
			break;
		case "CALL":
			break;
		case "BEGIN":
			for (var i in node.statements){
				constantFolding(node.statements[i]);
			}
			break;
		case "IF":
			constantFolding(node.condition);
			constantFolding(node.statements);
			break;
		case "IFELSE":
			constantFolding(node.condition);
			constantFolding(node.statements);
			constantFolding(node.elsestatements);
			break;
		case "ODD":
			constantFolding(node.expresion);
			break;
		case "==":
		case "!=":
		case "<=":
		case "<":
		case ">":
		case ">=":
			constantFolding(node.right);
			constantFolding(node.left);
		case "-":
		case "+":
		case "*":
		case "/":
			//CASO BASE
			var baseI = false;
			var baseD = false;
			var valorIzq = 0;
			var valorDer = 0;
			if(!node.value){
				if((node.left.type == "NUMBER" || node.left.type == "ID"  || node.left.type == "-") && (node.right.type == "NUMBER" || node.right.type == "ID" || node.right.type == "-")){								
					switch(node.left.type){
						case "NUMBER": valorIzq = parseFloat(node.left.value);  baseI = true; break;
						case "ID": if(estaDefinidoConstante(node.left.value)){
								valorIzq = getValorConstante(node.left.value); //definir getValorConstante("ID")
									baseI = true;
							   }else{	
									baseI = false;
							   }
						break;
						case "-": if(node.left.value){
							valorIzq = parseFloat(node.left.value.value)*-1 ; 
							baseI = true;
						}else{
							baseI = false;
						}
						break;
					}
				
					switch(node.right.type){
						case "NUMBER": valorDer = parseFloat(node.right.value); baseD = true; break;
						case "ID": if(estaDefinidoConstante(node.right.value)){
								valorDer = getValorConstante(node.right.value); //definir getValorConstante("ID")
									baseD = true;
								}else{	
									baseD = false;
								}
						break;
						case "-": if(node.right.value){
							valorDer = parseFloat(node.right.value.value)*-1;
							baseD = true;
						}else{
							baseD = false;
						}
						break;
					}
				
				}
				if(baseI == true && baseD == true){
						console.log(valorIzq);
						console.log(valorDer);
						switch(node.type){
							case "+":	
							delete node.right;
								delete node.left;
								node.type = "NUMBER";
								node.value = valorIzq + valorDer;
								break;
							case "-":
								delete node.right;
								delete node.left;
								node.type = "NUMBER";
								node.value = valorIzq - valorDer;
								break;
							case "/":
								delete node.right;
								delete node.left;
								node.type = "NUMBER";
								if(valorDer == 0){
									throw("Error, cannot divide by 0");	
								}
								node.value = valorIzq / valorDer;
								break;
							case "*":
								delete node.right;
								delete node.left;
								node.type = "NUMBER";
								node.value = valorIzq * valorDer;
								break;
						}
						cambio = true;
				}else{
					constantFolding(node.right);
					constantFolding(node.left);
				}
			}
		break;
		case "NUMBER":
			break;
		case "ID":
			break;
		}
}




/*
TO DO
Comprobar que si el nodo siguiente a un menos unario es un numero, se guarde directamente un nodo numero con el valor del numero negativo
*/
function nodeAnalysis(node){
	if (!node) return;

	switch (node.type){
		case "PROCEDURE": 
			var symbolTable = {name: node.value, father: symbolTableActual, consts: {}, vars: {}, procs: {}};
			symbolTableActual = symbolTable;
			if(node.hasOwnProperty("arguments") && node.arguments !== undefined){
				for(var i in node.arguments){
					symbolTable.vars[node.arguments[i].value]= node.arguments[i].value;
				}                      
			}
			if(node.block.hasOwnProperty("constantes") && node.block.constantes !== undefined){
				for (var i in node.block.constantes.value){
					
					if(!estaDefinidoActual(node.block.constantes.value[i].name)){
						symbolTable.consts[node.block.constantes.value[i].name] = node.block.constantes.value[i].value;	
					}else{
						throw("Constant " + node.block.constantes.value[i].name + " it's already defined");	
					}	
				}
			delete node.block.constantes;
			}
			if(node.block.hasOwnProperty("variables") && node.block.variables !== undefined){
				for (var i in node.block.variables.value){
					if(!estaDefinidoActual(node.block.variables.value[i].name)){
						symbolTable.vars[node.block.variables.value[i].name] = node.block.variables.value[i].name;	
					}else{
						throw("Variable " + node.block.variables.value[i].name + " it's already defined");	
					}
				}
			delete node.block.variables;
			}
			if(node.block.hasOwnProperty("procedimientos") && node.block.procedimientos !== undefined){
				for (var i in node.block.procedimientos){
					symbolTable.procs[node.block.procedimientos[i].value] = node.block.procedimientos[i].arguments.length;	
				}
			}
			node.symbolTable = symbolTable;
			
			if(node.block.hasOwnProperty("procedimientos") && node.block.procedimientos !== undefined){
				for (var i in node.block.procedimientos){
					nodeAnalysis(node.block.procedimientos[i]);
				}
			}
			if(node.block.hasOwnProperty("statements") && node.block.statements !== undefined){ 
							nodeAnalysis(node.block.statements);
			}	
	
			break;	
		case "ASSIGMENT":
			if (estaDefinidoConstante(node.left))
				throw("You can't assign a value to \""+ node.left + "\" because it is a constant");	
			if (!estaDefinido(node.left))
				throw("Identifier \""+ node.left + "\" has not being declared and it's being used");	
			nodeAnalysis(node.right);
			break;
		case "CALL":
			if(estaDefinidoProcedure(node.name) == -1){
				throw("Identifier \""+ node.name + "\" has not being declared and it's being used");	
			}else if(estaDefinidoProcedure(node.name) != node.arguments.length){
					throw("Procedure \""+ node.name + "\" expects " + estaDefinidoProcedure(node.name)+ " arguments");	
			}else{
				for (var i in node.arguments){
					if(!estaDefinido(node.arguments[i].value)){
						throw("Identifier \""+ node.arguments[i].value + "\" has not being declared and it's being used");
					}					
				}

			}
			
			break;
		case "BEGIN":
			for (var i in node.statements){
				nodeAnalysis(node.statements[i]);
			}
			break;
		case "IF":
			nodeAnalysis(node.condition);
			nodeAnalysis(node.statements);
			
			break;
		case "IFELSE":
			nodeAnalysis(node.condition);
			nodeAnalysis(node.statements);
			nodeAnalysis(node.elsestatements);
			break;
		case "ODD":
			nodeAnalysis(node.expresion);
			break;
		case "==":
		case "!=":
		case "<=":
		case "<":
		case ">":
		case ">=":
		case "+":
		case "*":
		case "/": 
			nodeAnalysis(node.left);
			nodeAnalysis(node.right);
			break;
		case "-":
			if(node.value){
				nodeAnalysis(node.value);
			}else{
				nodeAnalysis(node.left);
				nodeAnalysis(node.right);
			}
			break;	
		case "NUMBER":
			break;
		case "ID":
			if (!estaDefinido(node.value))
				throw("Identifier \""+ node.value + "\" has not being declared and it's being used");
			if(estaDefinidoConstante(node.value)){
				var aux = getValorConstante(node.value);
				delete node.type;
				delete node.value;
				node.type = "NUMBER";
				node.value = aux;
			}
			break;
	}

}


function scopeAnalysis(tree){
	//CREO TABLA SIMBOLOS GENERAL
	var symbolTable = {name: "raiz", father: null, consts: {}, vars: {}, procs: {}};
	symbolTableActual = symbolTable;
	if(tree.hasOwnProperty("constantes") && tree.constantes !== undefined){
		for (var i in tree.constantes.value){
			if(!estaDefinidoActual(tree.constantes.value[i].name)){
				symbolTable.consts[tree.constantes.value[i].name] = tree.constantes.value[i].value;	
			}else{
				throw("Constant " + tree.constantes.value[i].name + " it's already defined");	
			}
		}
	delete tree.constantes;
	}
	if(tree.hasOwnProperty("variables") && tree.variables !== undefined){
		for (var i in tree.variables.value){
				if(!estaDefinidoActual(tree.variables.value[i].name)){
						symbolTable.vars[tree.variables.value[i].name] = tree.variables.value[i].name;	
				}else{
						throw("Variable " + tree.variables.value[i].name + " it's already defined");	
				}
		}
	delete tree.variables;
	}
	if(tree.hasOwnProperty("procedimientos") && tree.procedimientos !== undefined ){
		for (var i in tree.procedimientos){
			symbolTable.procs[tree.procedimientos[i].value] = tree.procedimientos[i].arguments.length;	
		}
	}
	tree.symbolTable = symbolTable;
	
	
	if(tree.hasOwnProperty("procedimientos") && tree.procedimientos !== undefined){
		for (var i in tree.procedimientos){
			nodeAnalysis(tree.procedimientos[i]);
		}
	}

	if(tree.hasOwnProperty("statements") && tree.statements !== undefined){
					nodeAnalysis(tree.statements);
	}

	return tree;
}

function estaDefinido(id){
	if(estaDefinidoVariable(id) || estaDefinidoConstante(id)){
		return true;
	}
	return false;
}
 
function estaDefinidoVariable(id){
        var symbolTableAux = symbolTableActual;
        do{
                var contenido = symbolTableAux.vars[id];
                if(contenido === undefined){
                   symbolTableAux = symbolTableAux.father;
                }else{
                   return true;        
                }
        }while(symbolTableAux != null);
        return false;
}

function estaDefinidoActualVariable(id){
        var symbolTableAux = symbolTableActual;
        var contenido = symbolTableAux.vars[id];
        if(contenido === undefined){
               return false;
        }else{
               return true;        
        }
}



function estaDefinidoActualConstante(id){
        var symbolTableAux = symbolTableActual;
        var contenido = symbolTableAux.consts[id];
        if(contenido === undefined){
               return false;
        }else{
               return true;        
        }
}

function estaDefinidoActual(id){
	if(estaDefinidoActualVariable(id) || estaDefinidoActualConstante(id)){
		return true;
	}
	return false;
}

 
function estaDefinidoConstante(id){
        var symbolTableAux = symbolTableActual;
        do{
                var contenido = symbolTableAux.consts[id];
                if(contenido === undefined){
                   symbolTableAux = symbolTableAux.father;
                }else{
                   return true;        
                }
        }while(symbolTableAux != null);
        return false;
}

function getValorConstante(id){
	var symbolTableAux = symbolTableActual;
        do{
                var contenido = symbolTableAux.consts[id];
                if(contenido === undefined){
                   symbolTableAux = symbolTableAux.father;
                }else{
                   return parseFloat(contenido);        
                }
        }while(symbolTableAux != null);
        return -9999;
}

function estaDefinidoProcedure(id){
        var symbolTableAux = symbolTableActual;
        do{
                var contenido = symbolTableAux.procs[id];
                if(contenido === undefined){
                   symbolTableAux = symbolTableAux.father;
                }else{
                   return contenido;       
                }
        }while(symbolTableAux != null);
        return -1;
}
