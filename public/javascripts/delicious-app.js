import "../sass/style.scss";

import { $, $$ } from "./modules/bling";
import typeAheadStudent from "./modules/typeAheadStudent";
import typeAheadTeacher from "./modules/typeAheadTeacher";
import typeAheadUser from "./modules/typeAheadUser";

typeAheadStudent($(".student"));
typeAheadTeacher($(".teacherSearch"));
typeAheadUser($(".userSearch"));
