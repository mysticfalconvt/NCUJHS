import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAheadStudent from './modules/typeAheadStudent';
import typeAheadTeacher from './modules/typeAheadTeacher';
import typeAheadUser from './modules/typeAheadUser';


autocomplete($('#address'), $('#lat'), $('#lng'));

typeAheadStudent($('.student'));
typeAheadTeacher($('.teacherSearch'));
typeAheadUser($('.userSearch'));


