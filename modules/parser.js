export default class Parser {
    var = [];
    parse(data) {
        let that = this;
        data = data + "\0";
        const Kind = {
            Print: 0,
            Lparen: 1,
            Rparen: 2,
            Plus: 3,
            Minus: 4,
            Multi: 5,
            Divi: 6,
            Mod: 7,
            Assign: 8,
            Less: 9,
            Great: 10,
            LessEq: 11,
            GreatEq: 12,
            Eq: 13,
            NotEq: 14,
            Or: 15,
            And: 16,
            EofTkn: 17,
            VarName: 18,
            IntNum: 19,
            Others: 20,
        };
        const KeyTable = {
            "(": Kind.Lparen,
            ")": Kind.Rparen,
            "+": Kind.Plus,
            "-": Kind.Minus,
            "*": Kind.Multi,
            "/": Kind.Divi,
            "%": Kind.Mod,
            "=": Kind.Assign,
            "?": Kind.Print,
            "<": Kind.Less,
            ">": Kind.Great,
            "<=": Kind.LessEq,
            ">=": Kind.GreatEq,
            "==": Kind.Eq,
            "!=": Kind.NotEq,
            "||": Kind.Or,
            "&&": Kind.And,
            "\0": Kind.EofTkn,
        };
        let index = 0;
        let ch = "";
        function nextChar() {
            ch = data[index++];
        }
        nextChar();
        let token = null;
        function nextToken() {
            token = { kind: Kind.Others, val: 0 };

            while(isspace(ch)) nextChar();

            if(isdigit(ch)) {
                let num;
                for(num = 0; isdigit(ch); nextChar()) {
                    num = num * 10 + todigit(ch);
                }
                token = { kind: Kind.IntNum, val: num };
            } else if(islower(ch)) {
                token = { kind: Kind.VarName, val: tolowerdigit(ch) };
                nextChar();
            } else {
                let key1 = ch;
                let key2 = ch + nextChar();
                for(let key in KeyTable) {
                    if(key1 == key || key2 == key) {
                        token = { kind: KeyTable[key], val: 0 };
                        break;
                    }
                }
            }
        }
        let res;
        function err() {
            res = "> Error";
        }
        function checkToken(tk) {
            let match = token.kind != tk;
            if(match) err();
            return match;
        }
        function statement() {
            nextToken();

            switch(token.kind) {
                case Kind.VarName:
                    let name = token.val;
                    nextToken();
                    if(checkToken(Kind.Assign)) break;
                    nextToken();
                    expression();
                    that.var[name] = pop();
                    break;
                case Kind.Print:
                    nextToken();
                    expression();
                    res = pop();
                    return;
                default:
                    err();
            }
            checkToken(Kind.EofTkn);
        }
        function expression() {
            term();
            while(once(token.kind, Kind.Plus, Kind.Minus)) {
                let op = token.kind;
                nextToken();
                term();
                operate(op);
            }
        }
        function term() {
            factor();
            while(once(token.kind, Kind.Multi, Kind.Divi)) {
                let op = token.kind;
                nextToken();
                term();
                operate(op);
            }
        }
        function factor() {
            switch(token.kind) {
                case Kind.VarName:
                    push(that.var[token.val]);
                    break;
                case Kind.IntNum:
                    push(token.val);
                    break;
                case Kind.Lparen:
                    nextToken();
                    expression();
                    checkToken(Kind.Rparen);
                    break;
                default:
                    err();
            }
            nextToken();
        }
        function operate(op) {
            let d2 = pop();
            let d1 = pop();

            if(op == Kind.Divi && d2 == 0) {
                res = "> Cannot divided by 0";
                return;
            }
            switch(op) {
                case Kind.Plus:
                    push(d1 + d2);
                    break;
                case Kind.Minus:
                    push(d1 - d2);
                    break;
                case Kind.Multi:
                    push(d1 * d2);
                    break;
                case Kind.Divi:
                    push(d1 / d2);
            }
        }
        let stack = [];
        function push(n) {
            stack.push(n);
        }
        function pop() {
            if(stack.length < 1) {
                res = "> Stack underflow";
                return;
            }
            return stack.pop();
        }
        statement();
        return res;

        function once(val, ...cond) {
            return !!cond.find(v => {
                if(v == val) return true;
            });
        }
        function isspace(s) {
            return !!s.match(/^\s$/);
        }
        function isdigit(s) {
            return !!s.match(/^\d$/);
        }
        function todigit(s) {
            return s.charCodeAt() - 48;
        }
        function islower(s) {
            return !!s.match(/^[a-z]$/);
        }
        function tolowerdigit(s) {
            return s.charCodeAt() - 97;
        }
    }
}