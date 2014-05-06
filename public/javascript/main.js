$(document).ready(function() {
  $('#parse').click(function() {
    editor = $(".CodeMirror")[0].CodeMirror
    var result;
    try {
      result = pl0.parse(editor.getValue());
      $('#output').html(JSON.stringify(result,undefined,2));
      $('#ambit').html(JSON.stringify(scopeAnalysis(result),undefined,2));

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

function nodeAnalysis(node){
	if (!node) return;

	switch (node.type){
		case "PROCEDURE": 
			var symbolTable = {name: node.value, father: symbolTableActual, consts: {}, vars: {}, procs: {}};

			if(node.hasOwnProperty("arguments") && node.arguments !== undefined){
				for(var i in node.arguments){
					symbolTable.vars[node.arguments[i].value]= node.arguments[i].value;
				}                      
			}
			if(node.block.hasOwnProperty("constantes") && node.block.constantes !== undefined){
				for (var i in node.block.constantes.value){
					symbolTable.consts[node.block.constantes.value[i].name] = node.block.constantes.value[i].value;	
				}
			delete node.block.constantes;
			}
			if(node.block.hasOwnProperty("variables") && node.block.variables !== undefined){
				for (var i in node.block.variables.value){
					symbolTable.vars[node.block.variables.value[i].name] = node.block.variables.value[i].name;	
				}
			delete node.block.variables;
			}
			if(node.block.hasOwnProperty("procedimientos") && node.block.procedimientos !== undefined){
				for (var i in node.block.procedimientos){
					symbolTable.procs[node.block.procedimientos[i].value] = node.block.procedimientos[i].arguments.length;	
				}
			}
			node.symbolTable = symbolTable;
			symbolTableActual = symbolTable;
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
			//COMPROBAR QUE LA FUNCION EXISTE Y TIENE EL NUMERO DE ARGUMENTOS CORRECTOS
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
			break;
	}

}


function scopeAnalysis(tree){
	//CREO TABLA SIMBOLOS GENERAL
	 var symbolTable = {name: "raiz", father: null, consts: {}, vars: {}, procs: {}};

	if(tree.hasOwnProperty("constantes") && tree.constantes !== undefined){
		for (var i in tree.constantes.value){
			symbolTable.consts[tree.constantes.value[i].name] = tree.constantes.value[i].value;	
		}
	delete tree.constantes;
	}
	if(tree.hasOwnProperty("variables") && tree.variables !== undefined){
		for (var i in tree.variables.value){
			symbolTable.vars[tree.variables.value[i].name] = tree.variables.value[i].name;	
		}
	delete tree.variables;
	}
	if(tree.hasOwnProperty("procedimientos") && tree.procedimientos !== undefined ){
		for (var i in tree.procedimientos){
			symbolTable.procs[tree.procedimientos[i].value] = tree.procedimientos[i].arguments.length;	
		}
	}
	tree.symbolTable = symbolTable;
	symbolTableActual = symbolTable;
	
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
