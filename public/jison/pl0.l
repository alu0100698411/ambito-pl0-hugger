/* description: Parses end evaluates mathematical expressions. */
 %{
var reserved_words ={ CALL: 'CALL', WHILE: 'WHILE', DO: 'DO', BEGIN: 'BEGIN', END: 'END', IF: 'IF', THEN: 'THEN', ELSE: 'ELSE', PROCEDURE: 'PROCEDURE', ODD: 'ODD', VAR: 'VAR', CONST: 'CONST'}

function idORrw(x) {
  return (x.toUpperCase() in reserved_words)? x.toUpperCase() : 'ID';
}





%}
/* lexical grammar */
%%
\s+                        {/* skip whitespace */}
"^"                        	 {return '^';}
"("                        	 {return '(';}
")"                       	 {return ')';}
";"			  	 {return ';';}
","				 {return ',';}
"."                       	 {return '.';}
"+"				 {return '+';}
"-"                       	 {return '-';}
"*"				 {return '*';}
"/"                       	 {return '/';}
[<>=!][=]|[<>]                   {return 'COMPARISON'};
"="                      	 {return '=';}
"CALL"                    	 {return 'CALL';}
"WHILE"                   	 {return 'WHILE';}
"DO"                      	 {return 'DO';}
"BEGIN"                   	 {return 'BEGIN';}
"END"                     	 {return 'END';}
"IF"                      	 {return 'IF';}
"THEN"                    	 {return 'THEN';}
"ELSE"                    	 {return 'ELSE';}
"PROCEDURE"                	 {return 'PROCEDURE';}
"ODD"                      	 {return 'ODD';}
"VAR"                            {return 'VAR';}
"CONST"                          {return 'CONST';}
\b\d+("."\d*)?([eE][-+]?\d+)?\b  {return 'NUMBER';}
\b[A-Za-z_]\w*\b                 {return idORrw(yytext);}
//[+-]                           {return 'ADDSUBOP';}
//[*/] 			         {return 'MULTDIVOP';}
<<EOF>>                    	 {return 'EOF';}
