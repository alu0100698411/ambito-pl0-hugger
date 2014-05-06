%token CALL WHILE DO VAR CONST NUMBER ID BEGIN END IF ELSE THEN PROCEDURE ODD
 
%left IF
%left THEN
%left ELSE
 
/* operator associations and precedence */
%right '='
%left '+' '-'
%left '*' '/'
%left '^'
%right '%'
%left UMINUS
%left '!'
 
%start program
 
%% /* language grammar */
program
        : block "." EOF {return $1}
        ;
 
/*block = [ "const" ident "=" number {";" ident "=" number} ";"]
        [ "var" ident {"," ident} ";"]
        { "procedure" ident ";" block ";" } statement .*/
 
block
        : constant variable procedure statement { $$ = { type: "BLOCK",
							 constantes: $1,
							 variables: $2,
							 procedimientos: $3,
							 statements: $4 }; }
        ;
 
variable
        : /* empty */
        | VAR idlist ";" variable {	
                                        $$ = {type:$1, value:$2};
                                        if ($4 && $4.value.length > 0)
                                                $$.value = $$.value.concat($4.value);
                                    }
        ;
idlist
        : ident {$$ = [$1];}
        | idlist ","  ident {
                                        $$ = [$3];
                                        if ($1 && $1.length > 0)
                                                $$ = $$.concat($1);
                                    }
        ;
 
ident
	: ID {$$ = {name: $1};}
	;

 
constant
        : /* empty */
        | CONST constantlist ";" constant {
                                        $$ = {type:$1, value:$2};
                                        if ($4 && $4.value.length > 0)
                                                $$.value = $$.value.concat($4.value);
                                    }
        ;
 
constantlist
        : idnumber {$$ =  [$1];}
        | constantlist ","  idnumber {
                                        $$ = $1;
					$$ = $$.concat($3);
                                    }
        ;
 
idnumber
        :  ID "=" NUMBER { $$ = { name: $1, value: $3 }; }
        ;
 
argumentlist
        : base {$$ = [$1];}
        | argumentlist ","  base  {
                                        $$ = $1;
					$$ = $$.concat($3);
                                    }
        | /* empty */
        ;
 
 
procedure
        : /* empty */
        | PROCEDURE ID "(" argumentlist ")" ";" block ";" procedure { $$ = [{   type: $1,
                                                                                value: $2,
                                                                                arguments: $4,
                                                                                block: $7
                                                                        }];
                                                                        if ($9 && $9.length > 0)
                                                                                $$ = $$.concat($9);
                                                                        }
        ;
 
/*statement = [ ident ":=" expression | "call" ident |
            "begin" statement {";" statement } "end" |
            "if" condition "then" statement |
            "while" condition "do" statement ]*/

statement
        : ID "=" expresion { $$ = { type: "ASSIGMENT", left: $1, right: $3 }; }
        | CALL ID "(" argumentlist ")" { $$ = { type: $1, name: $2, arguments: $4 }; }
        | BEGIN statementlist END { $$ = { type: $1, statements: $2 }; }
        | ifstatement {$$ = $1;}
        | WHILE '(' condition ')'  DO statement { $$ = { type: $1, condition: $3, statements: $6 }; }
        ;
 
ifstatement
        : IF '(' condition ')' THEN statement { $$ = { type: "IF", condition: $3, statements: $5 }; }
        | IF '(' condition ')' THEN statement ELSE statement { $$ = { type: "IFELSE", condition: $3, statements: $6, elsestatements: $8 }; }
        ;
 
statementlist
        : statement {$$ = [$1];}
        | statementlist ";" statement {
                                        $$ = $1;
					$$ = $$.concat($3);
                                    }
        ;
 
/*condition = "odd" expression |
            expression ("="|"#"|"<"|"<="|">"|">=") expression */
 
condition
        : ODD expresion { $$ = { type: $1, expresion: $2}; }
        | expresion COMPARISON expresion { $$ = { type: $2, left: $1, right: $3 }; }
        ;

expresion
  : expresion '+' expresion { $$ = { type: $2, left: $1, right: $3 }; }
  | expresion '-' expresion { $$ = { type: $2, left: $1, right: $3 }; }
  | expresion '*' expresion { $$ = { type: $2, left: $1, right: $3 }; }
  | expresion '/' expresion { $$ = { type: $2, left: $1, right: $3 }; }
  | '-' expresion %prec UMINUS {$$ = { type: $1, value: $2 }; }
  | base { $$ = $1;}
  ;

base
        : ID {$$ = {type: 'ID', value: yytext};}
        | NUMBER { $$ = {type: 'NUMBER', value: yytext};}
        | "(" expresion ")" {$$ = $2;}
        ;


