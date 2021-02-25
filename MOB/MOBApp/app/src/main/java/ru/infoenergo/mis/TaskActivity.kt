package ru.infoenergo.mis

import android.app.Activity
import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.ContentValues
import android.content.DialogInterface
import android.content.Intent
import android.content.res.Configuration
import android.database.Cursor
import android.database.MatrixCursor
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageDecoder
import android.graphics.Matrix
import android.media.ExifInterface
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.provider.OpenableColumns
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.widget.*
import android.widget.AdapterView.OnItemSelectedListener
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.core.net.toUri
import androidx.core.view.setPadding
import androidx.core.widget.NestedScrollView
import androidx.core.widget.doAfterTextChanged
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.*
import kotlinx.android.synthetic.main.activity_new_task.*
import kotlinx.android.synthetic.main.activity_task.*
import kotlinx.android.synthetic.main.lvitem_task.*
import kotlinx.coroutines.*
import ru.infoenergo.mis.adapters.AdapterImageGallery
import ru.infoenergo.mis.adapters.AdapterListActsWithPhotos
import ru.infoenergo.mis.dbhandler.*
import ru.infoenergo.mis.helpers.*
import java.io.File
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*
import kotlin.collections.ArrayList


/*************************************************/
/**   Карточка задания из маршрутного листа     **/
/*************************************************/
class TaskActivity : AppCompatActivity(), DatePickerDialog.OnDateSetListener,
    TimePickerDialog.OnTimeSetListener, DialogInterface.OnCancelListener {

    private val _formatTime: DateTimeFormatter = DateTimeFormatter.ofPattern("HH ч. mm мин.    dd MMMM yyyy")
    // список, доступных для формирования актов
    private var _acts: ArrayList<ActInfo> = ArrayList()
    private val _actForAttach: ActFieldsInfo = ActFieldsInfo()
    private var _idTask: Int = 0
    private var _idInspector: Int = 0
    private var _task: Task = Task()

    // фотографии, прикрепленные к задаче
    private var _taskPhotos: ArrayList<FileInfo> = ArrayList()
    // акты, прикрепленные к задаче
    private var _taskActs: ArrayList<FileInfo> = ArrayList()

    // uri фото, сделанного только что на камеру
    private lateinit var _uriFromCamera: Uri

    private var newTaskDateTime = LocalDateTime.now()

    private lateinit var editTextAddress: EditText
    private lateinit var spinnerPurpose: Spinner
    private lateinit var imgStatus: ImageView
    private lateinit var textViewIdTask: TextView
    private lateinit var recyclerViewPhoto: RecyclerView
    private lateinit var lvActs: ListView
    private lateinit var tvDat: TextView

    private val viewModelJob = SupervisorJob()
    private val uiScope = CoroutineScope(Dispatchers.Main + viewModelJob)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_task)

        //Разрешить кнопку назад
        if (supportActionBar != null) {
            val actionBar = supportActionBar
            actionBar!!.setDisplayHomeAsUpEnabled(true)
            actionBar.elevation = 4.0F
        }

        _idTask = intent.getIntExtra("TASK_ID", 0)
        _idInspector = intent.getIntExtra("ID_INSPECTOR", 0)
        val adr = intent.getStringExtra("ADDRESS") ?: ""
        if (_idTask == 0)
            this.finish()

        when (_idTask) {
            // новое задание
            // -------------
            ID_NEW_TASK
            -> {
                initialViews()

                tvTaskStatus.text = "Добавлен инспектором"
                tvDat.apply {
                    text = newTaskDateTime?.format(_formatTime)

                    setOnClickListener {
                        val datePickerDialog = DatePickerDialog(
                            this@TaskActivity, this@TaskActivity,
                            LocalDate.now().year, LocalDate.now().monthValue - 1, LocalDate.now().dayOfMonth
                        )
                        datePickerDialog.show()
                    }
                }

                supportActionBar!!.title = "Создание новой задачи"
                supportActionBar!!.subtitle = ""

                textViewIdTask.text = ""
                editTextAddress.apply {
                    setText("")
                    isActivated = false
                    setPadding(10)
                    setBackgroundColor(resources.getColor(android.R.color.transparent))
                    setBackgroundResource(R.drawable.frame_radius5)
                }

                if (adr.isNotEmpty()) {
                    newTaskAddress.visibility = View.GONE
                    newTaskSearchAsuse.visibility = View.GONE
                }

                editTextAddress.setText(adr)
                etTaskPrim.setText("")
                etTaskFioContact.setText("")
                etTaskTelContact.setText("")

                spinnerPurpose.adapter = ArrayAdapter(this, R.layout.spitem_purpose, getListPurpose())
                spinnerPurpose.setSelection(0)
                setEditable(true)

            }
            // заполнение полей задания
            // ------------------------
            else -> {
                try {
                    _task = intent.getSerializableExtra("TASK") as Task
                    if (_task.id_task == 0)
                        this.finish()

                    initialViews()

                    setEditable(true)

                    // ID
                    textViewIdTask.text = _task.id_task.toString()

                    try {// Для новой задачи город, улица, дом, корпус
                        if (_task.id_task < 0 && _task.status in arrayOf(0, -12) &&
                            (_task.kod_obj == 0 || _task.kod_dog == 0)
                        ) {
                            textViewIdTask.setBackgroundResource(R.color.colorLightGrayDD)

                            if (_task.city.isEmpty() && _task.street.isEmpty()
                                && (_task.house == "0" || _task.house.isEmpty()) && _task.nd.isEmpty())
                                newTaskAddress.visibility = View.GONE

                            etNewTaskCity.setText(_task.city)
                            etNewTaskStreet.setText(_task.street)
                            etNewTaskHouse.setText(_task.house)
                            etNewTaskNd.setText(_task.nd)
                        }

                        if (_task.status in arrayOf(0, -12)) {
                            btnTaskDelete.setOnClickListener {
                                val builder = android.app.AlertDialog.Builder(this)
                                builder.setTitle("Внимание!")
                                    .setMessage("Подтверждаете Удаление задачи?")
                                    .setIcon(R.drawable.ic_question)
                                    .setNegativeButton("Отмена") { dialog, _ ->
                                        dialog.cancel()
                                    }
                                    .setPositiveButton("Да") { _, _ ->
                                        val dbWritable = DbHandlerLocalWrite(this, null)
                                        try {
                                            if (dbWritable.deleteTask(_task.id_inspector, _task.id_task)) {
                                                println("$TAG_OK delete task end")
                                            }
                                        } catch (e: java.lang.Exception) {
                                            dbWritable.close()
                                            println("$TAG_ERR on delete task: ${e.message}")
                                        } finally {
                                            dbWritable.close()
                                            this@TaskActivity.finish()
                                        }
                                    }
                                builder.show()
                            }
                        }
                    } catch (e: Exception) {
                        println("$TAG_ERR TaskActivity new task views ${e.message}")
                    }

                    // Подписанты
                    try {
                        val dbRead = DbHandlerLocalRead(this@TaskActivity, null)
                        val podpisantsList = dbRead.getPodpisantList(_idTask)
                        dbRead.close()
                        if (podpisantsList.size > 1) {
                            val podpisantsNames = podpisantsList.map { it.fio }
                            spTaskFioPodp.adapter = ArrayAdapter(this, R.layout.spitem_purpose, podpisantsNames)
                            spTaskFioPodp.onItemSelectedListener = object : OnItemSelectedListener {
                                override fun onItemSelected(
                                    parentView: AdapterView<*>?,
                                    selectedItemView: View, position: Int, id: Long
                                ) {
                                    val podp = podpisantsList.firstOrNull {
                                        it.fio == spTaskFioPodp.adapter.getItem(position).toString()
                                    }
                                    if (podp != null) {
                                        tvTaskTelPodp.text = podp.tel
                                        tvTaskEmailPodp.text = podp.email

                                        _task.apply {
                                            kod_emp_podp = podp.kod_emp
                                            fio_podp = podp.fio
                                            tel_podp = podp.tel
                                            email_podp = podp.email
                                            name_dolzhn_podp = podp.name_dolzhn
                                        }
                                    }
                                }

                                override fun onNothingSelected(parentView: AdapterView<*>?) {}
                            }

                            // Если в задаче задан подписант, то находим его в спиннере и заполняем поля с конт. данными
                            val podp = podpisantsList.firstOrNull { it.kod_emp == _task.kod_emp_podp }
                            if (podp != null) {
                                val pos = podpisantsList.indexOf(podp)
                                spTaskFioPodp.setSelection(pos)
                                tvTaskTelPodp.text = _task.tel_podp
                                tvTaskEmailPodp.text = _task.email_podp
                            }
                        } else {
                            spTaskFioPodp.isEnabled = false
                            btnPhonePodp.visibility = View.GONE
                            tvTaskEmailPodp.visibility = View.GONE
                        }
                    } catch (e: Exception) {
                        println("$TAG_ERR TaskActivity podpisant ${e.message}")
                    }

                    // Дата
                    tvDat.text =
                        (_task.ttime!!).format(_formatTime)

                    if (_task.status in arrayOf(0, -12, 15) || _task.id_task < 0 && _task.status in arrayOf(12)) {
                        if (_task.payer_name == "") {
                            supportActionBar!!.title = "Задача создана инспектором"
                            supportActionBar!!.subtitle = _task.fio
                        } else {
                            supportActionBar!!.title = "Задача создана инспектором ${_task.fio}"
                            supportActionBar!!.subtitle = _task.payer_name
                        }
                    } else {
                        supportActionBar!!.title = if (_task.payer_name == "") " ? " else _task.payer_name
                        supportActionBar!!.subtitle = "Наименование абонента"
                    }

                    // Адрес
                    editTextAddress.apply {
                        setText(_task.address)
                        setPadding(10)
                        setBackgroundColor(resources.getColor(android.R.color.transparent))
                        setBackgroundResource(R.drawable.frame_radius5)
                    }

                    // Статус
                    findViewById<TextView>(R.id.tvTaskStatus).text = _task.status_name

                    // Примечание
                    etTaskPrim.setText(_task.prim)

                    // Контакты
                    etTaskFioContact.apply {
                        setText(_task.fio_contact)
                        setBackgroundColor(resources.getColor(android.R.color.transparent))
                    }

                    etTaskTelContact.apply {
                        setText(_task.tel_contact)
                        setBackgroundColor(resources.getColor(android.R.color.transparent))
                    }

                    // Цели
                    spinnerPurpose.adapter = ArrayAdapter(this, R.layout.spitem_purpose, getListPurpose())
                    spinnerPurpose.setSelection(_task.purpose - 1)

                    when (_task.status) {
                        // Изменено руководителем – бледно-серый + иконка бледно-оранжевый восклицательный знак
                        4, 5, 6, 7 -> {
                            imgStatus.visibility = View.VISIBLE
                            imgStatus.setImageResource(R.drawable.ic_warning_orange)
                            textViewIdTask.setBackgroundResource(R.color.colorLightGrayDD)
                            if (_task.dat!!.isBefore(LocalDate.now())) {
                                textViewIdTask.setBackgroundResource(R.color.colorLightPink)
                            }
                        }
                        // Удалено руководителем – бледно-серый  + иконка с красным крестом
                        8, 9, 10, 11 -> {
                            imgStatus.visibility = View.VISIBLE
                            imgStatus.setImageResource(R.drawable.ic_cancel_red)
                            textViewIdTask.setBackgroundResource(R.color.colorLightGrayDD)
                            if (_task.dat!!.isBefore(LocalDate.now())) {
                                textViewIdTask.setBackgroundResource(R.color.colorLightPink)
                            }
                        }
                        // Выполненное  – бледно-зелёный + иконка зелёная галочка
                        -12, 12 -> {
                            imgStatus.visibility = View.VISIBLE
                            imgStatus.setImageResource(R.drawable.ic_done_green)
                            textViewIdTask.setBackgroundResource(R.color.colorLightGreen)
                        }
                        else -> {
                            // Новое  –серый
                            //0, 1, 2, 3, 13, 15 -> {
                            textViewIdTask.setBackgroundResource(R.color.colorLightGrayDD)
                            imgStatus.visibility = View.GONE
                            if (_task.dat!!.isBefore(LocalDate.now())) {
                                textViewIdTask.setBackgroundResource(R.color.colorLightPink)
                            }
                            // }
                        }
                    }

                    loadAttachments()

                } catch (e: Exception) {
                    println("$TAG_ERR TaskActivity ${e.message}")
                }
            }
        }

        val dbRead = DbHandlerLocalRead(this, null)
        dbRead.close()
        _acts = /*if (_task.status in arrayOf(0, 15, -12)) {
            dbRead.getActNamesList(0)
        } else {*/
            dbRead.getActNamesList(_task.purpose)
        /*}*/

        setListenersSave()
        setListenerTaskDone()
        setListenersPhoto()
        setListenerPhone()
    }

    // Инициализация вьюх
    // -------------------------
    private fun initialViews() {
        editTextAddress = findViewById(R.id.etTaskAddress)
        val params = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
        params.topMargin = 10
        //params.marginStart = 10
        //params.marginEnd = 10
        editTextAddress.layoutParams = params

        // Для задачи созданной вручную - город, ул, номер дома, корпус;
        // Поиск задачи в асусэ
        if (_task.status in arrayOf(0, -12) || _idTask == ID_NEW_TASK) {
            etNewTaskCity.doAfterTextChanged {
                editTextAddress.setText("$it, ул. ${etNewTaskStreet.text}, д. ${etNewTaskHouse.text}")
                if (etNewTaskNd.text.isNotEmpty()) editTextAddress.setText("${editTextAddress.text}, к. ${etNewTaskNd.text} ")
                _task.apply {
                    kod_numobj = 0
                    kod_dog = 0
                    kodp = 0
                    kod_obj = 0
                    ndog = ""
                    payer_name = ""
                }
            }
            etNewTaskStreet.doAfterTextChanged {
                editTextAddress.setText("${etNewTaskCity.text}, ул. $it, д. ${etNewTaskHouse.text}")
                if (etNewTaskNd.text.isNotEmpty()) editTextAddress.setText("${editTextAddress.text}, к. ${etNewTaskNd.text} ")
                _task.apply {
                    kod_numobj = 0
                    kod_dog = 0
                    kodp = 0
                    kod_obj = 0
                    ndog = ""
                    payer_name = ""
                }
            }
            etNewTaskHouse.doAfterTextChanged {
                editTextAddress.setText("${etNewTaskCity.text}, ул. ${etNewTaskStreet.text}, д. $it")
                if (etNewTaskNd.text.isNotEmpty()) editTextAddress.setText("${editTextAddress.text}, к. ${etNewTaskNd.text} ")
                _task.apply {
                    kod_numobj = 0
                    kod_dog = 0
                    kodp = 0
                    kod_obj = 0
                    ndog = ""
                    payer_name = ""
                }
            }
            etNewTaskNd.doAfterTextChanged {
                editTextAddress.setText("${etNewTaskCity.text}, ул. ${etNewTaskStreet.text}, д. ${etNewTaskHouse.text}")
                if (it!!.isNotEmpty()) editTextAddress.setText("${editTextAddress.text}, к. $it ")
                _task.apply {
                    kod_numobj = 0
                    kod_dog = 0
                    kodp = 0
                    kod_obj = 0
                    ndog = ""
                    payer_name = ""
                }
            }

            newTaskAddress.visibility = View.VISIBLE
            newTaskSearchAsuse.visibility = View.VISIBLE

            val searchView: SearchView = findViewById(R.id.searchViewTaskObject)
            //searchView.onActionViewExpanded()

            if (!isNetworkAvailable(this@TaskActivity)) {
                enableSearchView(searchView, false)
            } /*else {
                searchView.setQuery(
                    "${etNewTaskCity.text} ${etNewTaskStreet.text} ${etNewTaskHouse.text} ", false
                )
            }*/
        } else {
            newTaskAddress.visibility = View.GONE
            newTaskSearchAsuse.visibility = View.GONE
        }

        // Поиск объекта в асусэ
        // ---------------------
        try {
            val searchView: SearchView = findViewById(R.id.searchViewTaskObject)
            searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
                override fun onQueryTextChange(newText: String): Boolean {
                    return false
                }

                override fun onQueryTextSubmit(query: String): Boolean {
                    var objects: java.util.ArrayList<SearchObjectInfo>
                    uiScope.launch {
                        try {
                            objects = withContext(Dispatchers.IO) {
                                DBHandlerServerRead(this@TaskActivity).findObjectAsync(query)
                            }

                            if (objects.size != 0) {
                                val cursor = MatrixCursor(
                                    arrayOf(
                                        "_id",
                                        "kod_dog",
                                        "kodp",
                                        "kod_obj",
                                        "ndog",
                                        "name",
                                        "adr",
                                        "adr_view"
                                    )
                                )
                                objects.forEach {
                                    cursor.newRow()
                                        .add(it.kod_numobj)
                                        .add(it.kod_dog)
                                        .add(it.kodp)
                                        .add(it.kod_obj)
                                        .add(it.ndog)
                                        .add(it.name)
                                        .add(it.adr)
                                        .add("${it.name};  ${it.adr}")
                                }
                                val cursorAdapter = SimpleCursorAdapter(
                                    this@TaskActivity, //Context
                                    R.layout.lvitem_new_task, //Layout to inflate
                                    cursor, //My cursor
                                    arrayOf("ndog", "adr_view"), //Column Name of Data to Get
                                    intArrayOf(
                                        R.id.tvNewTaskNumDog,
                                        R.id.tvNewTaskAbonName
                                    ), //View to bind data
                                    SimpleCursorAdapter.FLAG_REGISTER_CONTENT_OBSERVER
                                )

                                searchView.suggestionsAdapter = cursorAdapter
                                cursorAdapter.notifyDataSetChanged()
                            }

                        } catch (e: Exception) {
                            println("$TAG_ERR onQueryTextSubmit: ${e.message}")
                        }
                    }
                    return false
                }
            })

            searchView.setOnSuggestionListener(object : SearchView.OnSuggestionListener {
                override fun onSuggestionSelect(position: Int): Boolean {
                    return true
                }

                // После того, как кликнули (выбрали) на объект после поиска объекта в асусэ
                // -------------------------------------------------------------------------
                override fun onSuggestionClick(position: Int): Boolean {
                    return try {
                        val cursor = searchView.suggestionsAdapter.cursor
                        cursor.moveToPosition(position)
                        val adr = cursor.getString(6)
                        _task.address = adr
                        searchView.setQuery(adr, true) //sett
                        editTextAddress.setText(adr)

                        _task.apply {
                            kod_numobj = cursor.getInt(0)
                            kod_dog = cursor.getInt(1)
                            kodp = cursor.getInt(2)
                            kod_obj = cursor.getInt(3)
                            ndog = cursor.getString(4)
                            payer_name = cursor.getString(5)
                        }
                        true
                    } catch (e: Exception) {
                        println("$TAG_ERR onSuggestionClick: ${e.message}")
                        false
                    }
                }
            })

        } catch (e: Exception) {
            println("$TAG_ERR Поиск объекта в асусэ: ${e.message}")
        }


        spinnerPurpose = findViewById(R.id.spTaskPurpose)
        imgStatus = findViewById(R.id.imageTaskStatus)
        textViewIdTask = findViewById(R.id.tvIdTask)
        tvDat = findViewById(R.id.tvTaskDate)

        lvActs = findViewById(R.id.listViewTaskActs)
        registerForContextMenu(lvActs)   // Подключение контекстного меню (удаление)

        recyclerViewPhoto = findViewById(R.id.recycleImageGallery)
        recyclerViewPhoto.isHorizontalScrollBarEnabled = true
        recyclerViewPhoto.layoutManager = LinearLayoutManager(this@TaskActivity, LinearLayoutManager.HORIZONTAL, false)
        registerForContextMenu(recyclerViewPhoto)  // Подключение контекстного меню (удаление)
    }

    // Заблокировать ввод в searchView
    // ---------------------------------------------------------
    private fun enableSearchView(view: View, enabled: Boolean) {
        view.isEnabled = enabled
        view.isFocusedByDefault = false
        if (view is ViewGroup) {
            for (i in 0 until view.childCount) {
                val child = view.getChildAt(i)
                enableSearchView(child, enabled)
            }
        }
    }

    // Вложенные файлы
    // -----------------------------
    private fun loadAttachments() {
        // Акты
        // ----------------------------------------------------------
        val dbReadable = DbHandlerLocalRead(this, null)
        val arrayFilesInfo: ArrayList<FileInfo> = dbReadable.getFiles(_idTask)
        dbReadable.close()

        if (arrayFilesInfo.size > 0) {
            _taskActs = arrayFilesInfo.filter {
                it.filename.takeLast(4).contains(".pdf", true) ||
                        it.paper == 1
            } as java.util.ArrayList<FileInfo>

            if (_taskActs.size > 0) {
                lvActs.adapter = AdapterListActsWithPhotos(this@TaskActivity, _taskActs)
                (lvActs.adapter as AdapterListActsWithPhotos).onItemClick = {
                    if (it.filename.substringAfterLast(".").toLowerCase(Locale.ROOT) in arrayOf("jpg", "jpeg", "bmp", "png", "gif"))
                        openPhoto(it)
                }
                lvActs.layoutParams =
                    LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, calcListViewHeight(lvActs))
                lvActs.visibility = View.VISIBLE
                (lvActs.adapter as AdapterListActsWithPhotos).notifyDataSetChanged()
            } else {
                lvActs.visibility = View.GONE
            }

            // Фотографии
            // --------------------------------------------
            _taskPhotos = arrayFilesInfo.filter {
                it.filename.substringAfterLast(".")
                    .toLowerCase() in arrayOf("jpg", "jpeg", "bmp", "png", "gif")
                        && it.paper == 0 && it.filedata != null
            } as java.util.ArrayList<FileInfo>

            if (_taskPhotos.size > 0) {
                val photoAdapter = AdapterImageGallery(_taskPhotos, history = false)
                photoAdapter.onItemClick = { photo ->
                    openPhoto(photo)
                }
                recyclerViewPhoto.adapter = photoAdapter
                (recyclerViewPhoto.adapter as AdapterImageGallery).notifyDataSetChanged()
                recyclerViewPhoto.visibility = View.VISIBLE
            } else {
                recyclerViewPhoto.visibility = View.GONE
            }
        }
    }

    // Вычисление высоты Listview (но не больше 500dp)
    // -----------------------------------------------
    private fun calcListViewHeight(lvObjects: ListView): Int {
        val maxHeight =
            if (resources.configuration.orientation == Configuration.ORIENTATION_PORTRAIT)
                500 else 200
        var totalHeight = 4
        for (i in 0 until lvObjects.adapter.count) {
            if (totalHeight > maxHeight) break
            val listItem: View = lvObjects.adapter.getView(i, null, lvObjects)
            listItem.measure(0, 0)
            totalHeight += listItem.measuredHeight
        }
        return totalHeight
    }

    // Открыть фото внутри TaskActivity
    // -------------------------------------
    private fun openPhoto(photo: FileInfo) {
        try {
            val bmp = BitmapFactory.decodeByteArray(photo.filedata, 0, photo.filedata!!.size)
            val touchImg = findViewById<TouchImageView>(R.id.tchImgFullPhoto)
            touchImg.visibility = View.VISIBLE
            val scroll = findViewById<NestedScrollView>(R.id.scrollView2)
            scroll.visibility = View.GONE
            touchImg?.setImageBitmap(Bitmap.createBitmap(bmp))
            touchImg.setOnClickListener {
                touchImg.visibility = View.GONE
                scroll.visibility = View.VISIBLE
            }
        } catch (e: Exception) {
            println("$TAG_ERR touchImg: ${e.message}")
        }
    }

    override fun onDateSet(view: DatePicker?, year: Int, month: Int, dayOfMonth: Int) {
        val calendar: Calendar = Calendar.getInstance()
        val hour = calendar.get(Calendar.HOUR_OF_DAY)
        val minute = calendar.get(Calendar.MINUTE)
        newTaskDateTime = LocalDateTime.of(year, month + 1, dayOfMonth, 10, 0)
        val timePickerDialog = TimePickerDialog(this@TaskActivity, this@TaskActivity, hour, minute, true)
        timePickerDialog.show()
    }

    override fun onTimeSet(view: TimePicker?, hourOfDay: Int, minute: Int) {
        newTaskDateTime =
            LocalDateTime.of(
                newTaskDateTime.year,
                newTaskDateTime.month,
                newTaskDateTime.dayOfMonth,
                hourOfDay,
                minute
            )
        tvDat.text = newTaskDateTime.format(_formatTime)
    }

    // Настройка возможности редактирования полей
    // ------------------------------------------
    private fun setEditable(allow: Boolean) {
        if (_idTask == ID_NEW_TASK) {
            // При создании заявки вручную
            editTextAddress.isEnabled = false
            spinnerPurpose.isEnabled = allow
            spinnerPurpose.isClickable = allow
            etTaskPrim.isEnabled = allow
            etTaskFioContact.isEnabled = allow
            etTaskTelContact.isEnabled = allow
            btnPhone.isClickable = false
            btnTaskDone.visibility = View.GONE
            btnTaskDone.isEnabled = false
            btnTakePhoto.isEnabled = false
            btnUploadPhoto.isEnabled = false
            btnUploadImageAct.isEnabled = false
            spTaskFioPodp.isEnabled = false
            spTaskFioPodp.visibility = View.GONE
            tvTaskTelPodp.visibility = View.GONE
            tvTaskEmailPodp.visibility = View.GONE
            tvTaskPodp.visibility = View.GONE
            btnPhonePodp.isEnabled = false
            btnPhonePodp.visibility = View.GONE
        } else if (_task.id_task < 0 && _task.status in arrayOf(0, 15, -12) && allow) {
            // При редактировании вручную созданной задачи
            editTextAddress.isEnabled = false
            spinnerPurpose.isEnabled = allow
            spinnerPurpose.isClickable = allow
            etTaskPrim.isEnabled = allow
            etTaskFioContact.isEnabled = allow
            etTaskTelContact.isEnabled = allow
            btnPhone.isClickable = !etTaskTelContact.text.isNullOrEmpty()
            btnUploadPhoto.isEnabled = allow
            btnUploadImageAct.isEnabled = allow
            btnTakePhoto.isEnabled = allow
            btnSaveTask.isEnabled = allow
            btnTaskDone.isEnabled = allow
            spTaskFioPodp.isEnabled = _task.kod_numobj != 0
            spTaskFioPodp.visibility = if (_task.kod_numobj != 0) View.VISIBLE else View.GONE
            tvTaskTelPodp.visibility = if (_task.kod_numobj != 0) View.VISIBLE else View.GONE
            tvTaskEmailPodp.visibility = if (_task.kod_numobj != 0) View.VISIBLE else View.GONE
            tvTaskPodp.visibility = if (_task.kod_numobj != 0) View.VISIBLE else View.GONE
            btnPhonePodp.isEnabled = _task.kod_numobj != 0
            btnPhonePodp.visibility = if (_task.kod_numobj != 0) View.VISIBLE else View.GONE
        } else {
            // При редактировании задачи со статусом <= 7
            // или запрет редактирования всего для задач со статусом > 7
            editTextAddress.isEnabled = false
            spinnerPurpose.isEnabled = false
            spinnerPurpose.isClickable = false
            etTaskPrim.isEnabled = allow
            etTaskFioContact.isEnabled = allow
            etTaskTelContact.isEnabled = allow
            btnPhone.isClickable = allow && !etTaskTelContact.text.isNullOrEmpty()
            btnPhone.isEnabled = allow && !etTaskTelContact.text.isNullOrEmpty()
            btnUploadPhoto.isEnabled = allow
            btnUploadImageAct.isEnabled = allow
            btnTakePhoto.isEnabled = allow
            btnSaveTask.isEnabled = allow
            btnTaskDone.isEnabled = allow
        }
    }

    // Слушатель на кнопки фотографий
    // -------------------------------
    private fun setListenersPhoto() {
        // Слушатель на кнопку "прикрепить фотографии"
        btnUploadPhoto.setOnClickListener {
            try {
                val dbRead = DbHandlerLocalRead(this, null)
                val allActsTask = dbRead.existedActsByIdTask(_idTask)
                dbRead.close()

                val ar = allActsTask.map {
                    it.num_act + " " +
                            if (_acts.firstOrNull { a -> a.id_act == it.id_act } == null) "" else _acts.first { a -> a.id_act == it.id_act }.name
                }.toTypedArray()
                AlertDialog.Builder(this@TaskActivity)
                    .setTitle("Выберите акт, к которому прикрепить фотографию")
                    .setSingleChoiceItems(ar, 0) { _, which ->
                        _actForAttach.id_act = allActsTask[which].id_act
                        _actForAttach.npp = allActsTask[which].npp
                        _actForAttach.num_act = allActsTask[which].num_act
                    }
                    .setPositiveButton("Выбрать") { dialog, _ ->
                        if (ar.isNotEmpty() && _actForAttach.id_act == 0 && _actForAttach.npp == 0) {
                            _actForAttach.id_act = allActsTask.first().id_act
                            _actForAttach.npp = allActsTask.first().npp
                            _actForAttach.num_act = allActsTask.first().num_act
                        }
                        val intent = Intent().apply {
                            type = "*/*"
                            action = Intent.ACTION_OPEN_DOCUMENT
                            addCategory(Intent.CATEGORY_OPENABLE)
                            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                            putExtra(
                                Intent.EXTRA_MIME_TYPES,
                                arrayOf("image/png", "image/jpg", "image/jpeg", "image/gif", "image/bmp")
                            )
                        }
                        startActivityForResult(intent, PHOTO_TO_ACT)
                        dialog.cancel()
                    }
                    .setNegativeButton("Не прикреплять к акту") { dialog, _ ->
                        val intent = Intent().apply {
                            type = "*/*"
                            action = Intent.ACTION_OPEN_DOCUMENT
                            addCategory(Intent.CATEGORY_OPENABLE)
                            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                            putExtra(
                                Intent.EXTRA_MIME_TYPES,
                                arrayOf("image/png", "image/jpg", "image/jpeg", "image/gif", "image/bmp")
                            )
                        }
                        startActivityForResult(intent, PICK_IMAGE_REQUEST)
                        dialog.cancel()
                    }
                    .create().show()

            } catch (e: Exception) {
                println("$TAG_ERR btnUploadPhoto: ${e.message}")
            }
        }

        // Слушатель на кнопку "прикрепить бумажный акт"
        btnUploadImageAct.setOnClickListener {
            try {
                val intent = Intent().apply {
                    type = "*/*"
                    action = Intent.ACTION_OPEN_DOCUMENT
                    addCategory(Intent.CATEGORY_OPENABLE)
                    putExtra(Intent.EXTRA_INTENT, true)
                    title = ""
                    putExtra(
                        Intent.EXTRA_MIME_TYPES,
                        arrayOf("image/png", "image/jpg", "image/jpeg", "image/gif", "image/bmp")
                    )
                }

                val dbRead = DbHandlerLocalRead(this, null)
                val allActsTask = dbRead.existedActsByIdTask(_idTask)
                dbRead.close()

                val ar = allActsTask.map { it.num_act + " " + _acts.first { a -> a.id_act == it.id_act }.name }
                    .toTypedArray()

                AlertDialog.Builder(this@TaskActivity)
                    .setTitle("Выберите тип прикрепляемого бумажного акта.")
                    .setSingleChoiceItems(ar, 0) { _, which ->
                        _actForAttach.id_act = allActsTask[which].id_act
                        _actForAttach.npp = allActsTask[which].npp
                        _actForAttach.num_act = allActsTask[which].num_act
                    }
                    .setPositiveButton("Выбрать") { dialog, _ ->
                        if (ar.isNotEmpty() && _actForAttach.id_act == 0 && _actForAttach.npp == 0) {
                            _actForAttach.id_act = allActsTask.first().id_act
                            _actForAttach.npp = allActsTask.first().npp
                            _actForAttach.num_act = allActsTask.first().num_act
                        }

                        startActivityForResult(intent, PAPER_TO_ACT)
                        dialog.cancel()
                    }
                    .setNegativeButton("Не прикреплять к акту") { dialog, _ ->
                        startActivityForResult(intent, PICK_PAPER_REQUEST)
                        dialog.cancel()
                    }
                    .create().show()

            } catch (e: Exception) {
                println("$TAG_ERR btnUploadImageAct: ${e.message}")
            }
        }

        // Слушатель на кнопку "сделать снимок"
        // ------------------------------------
        btnTakePhoto.setOnClickListener {
            try {
                val values = ContentValues()
                values.put(MediaStore.Images.Media.TITLE, "New Picture")
                values.put(MediaStore.Images.Media.DESCRIPTION, "From the Camera")
                values.put(MediaStore.Images.Media.DISPLAY_NAME, "${_idTask}_photo_${LocalDateTime.now()}.jpg")
                _uriFromCamera = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)!!
                //camera intent
                val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, _uriFromCamera)

                val dbRead = DbHandlerLocalRead(this, null)
                val allActsTask = dbRead.existedActsByIdTask(_idTask)
                dbRead.close()

                val ar = allActsTask.map { it.num_act + " " + _acts.first { a -> a.id_act == it.id_act }.name }
                    .toTypedArray()

                AlertDialog.Builder(this@TaskActivity)
                    .setTitle("Выберите акт, к которому прикрепить фотографию")
                    .setSingleChoiceItems(ar, 0) { _, which ->
                        _actForAttach.id_act = allActsTask[which].id_act
                        _actForAttach.npp = allActsTask[which].npp
                        _actForAttach.num_act = allActsTask[which].num_act
                    }
                    .setPositiveButton("Выбрать") { dialog, _ ->
                        if (ar.isNotEmpty() && _actForAttach.id_act == 0 && _actForAttach.npp == 0) {
                            _actForAttach.id_act = allActsTask.first().id_act
                            _actForAttach.npp = allActsTask.first().npp
                            _actForAttach.num_act = allActsTask.first().num_act
                        }

                        startActivityForResult(cameraIntent, CAMERA_TO_ACT)
                        dialog.cancel()
                    }
                    .setNegativeButton("Не прикреплять к акту") { dialog, _ ->
                        startActivityForResult(cameraIntent, CAMERA_REQUEST)
                        dialog.cancel()
                    }
                    .create().show()
            } catch (e: Exception) {
                println("$TAG_ERR btnTakePhoto: ${e.message}")
            }
        }
    }

    // Слушатель на кнопку "Позвонить"
    // -------------------------------
    private fun setListenerPhone() {
        // Слушатель на вызов по номеру тлф
        btnPhone.setOnClickListener {
            if (_task.tel_contact.isEmpty()) {
                return@setOnClickListener
            }
            val intent = Intent(Intent.ACTION_DIAL)
            val temp = "tel:" + _task.tel_contact
            intent.data = Uri.parse(temp)
            startActivity(intent)
        }
        // Слушатель на вызов по номеру тлф
        btnPhonePodp.setOnClickListener {
            if (_task.tel_podp.isEmpty()) {
                return@setOnClickListener
            }
            val intent = Intent(Intent.ACTION_DIAL)
            val temp = "tel:" + _task.tel_podp
            intent.data = Uri.parse(temp)
            startActivity(intent)
        }
    }

    // Слушатель на кнопку "Сохранить"
    // -------------------------------
    private fun setListenersSave() {
        btnSaveTask.setOnClickListener {
            if (_task.status in arrayOf(0, -12) || _idTask == ID_NEW_TASK) {
                if (newTaskAddress.visibility == View.VISIBLE && (_task.kod_obj == 0 || _task.kod_dog == 0)) {
                    if (etNewTaskCity.text.isNullOrEmpty()) {
                        etNewTaskCity.error = "Поле 'Город' не должно быть пустым."
                        return@setOnClickListener
                    }
                    if (etNewTaskStreet.text.isNullOrEmpty()) {
                        etNewTaskStreet.error = "Поле 'Улица' поле не должно быть пустым"
                        return@setOnClickListener
                    }
                    if (etNewTaskHouse.text.isNullOrEmpty()) {
                        etNewTaskHouse.error = "Поле 'Номер дома' не должно быть пустым"
                        return@setOnClickListener
                    }
                }
            }

            val msg = if (_idTask == ID_NEW_TASK) "Создать задачу?" else "Сохранить изменения?"

            val builder = android.app.AlertDialog.Builder(this)
            builder.setTitle("Внимание!")
                .setMessage(msg)
                .setIcon(R.drawable.ic_question)
                .setNegativeButton("Нет") { dialog, _ ->
                    dialog.cancel()
                }
                .setPositiveButton("Да") { _, _ ->
                    btnSaveTask.isEnabled = false
                    when (_idTask) {
                        ID_NEW_TASK -> {
                            if (insertNewTaskLocal()) {
                                setResult(Activity.RESULT_OK)
                                Toast.makeText(this@TaskActivity, "Задача успешно создана", Toast.LENGTH_LONG).show()
                            } else {
                                setResult(Activity.RESULT_CANCELED)
                                Toast.makeText(
                                    this@TaskActivity,
                                    "Произошла ошибка при создании задачи",
                                    Toast.LENGTH_LONG
                                ).show()
                                btnSaveTask.isEnabled = true
                            }
                        }
                        else -> {
                            if (updateExistTaskLocal()) {
                                //recreate()
                                intent.removeExtra("TASK")
                                intent.putExtra("TASK", _task)
                                finish()
                                intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                                //this.overridePendingTransition(0, 0);
                                startActivity(intent)
                            } else {
                                btnSaveTask.isEnabled = true
                            }
                        }
                    }
                }
            builder.show()
        }
    }

    // Insert вручную созданной задачи в лок БД
    // ----------------------------------------
    private fun insertNewTaskLocal(): Boolean {
        val dbWrite = DbHandlerLocalWrite(this@TaskActivity, null)
        val dbRead = DbHandlerLocalRead(this@TaskActivity, null)
        try {
            // Получаем минимальный id task
            val minIdTaskLocal = dbRead.getMinIdTask(_idInspector)
            val fioInspector = dbRead.getFioInspector(_idInspector)


            _task.apply {
                id_task = minIdTaskLocal
                dat = LocalDate.of(newTaskDateTime.year, newTaskDateTime.monthValue, newTaskDateTime.dayOfMonth)
                address = editTextAddress.text.toString()
                purpose = spinnerPurpose.selectedItemPosition + 1
                prim = etTaskPrim.text.toString()
                ttime = newTaskDateTime
                status = 0
                status_name = "Добавлен инспектором"
                fio_contact = etTaskFioContact.text.toString()
                tel_contact = etTaskTelContact.text.toString()
                id_inspector = _idInspector
                fio = fioInspector
                city = if (_task.kod_obj != 0 || !etNewTaskCity.isEnabled) "" else etNewTaskCity.text.toString()
                street = if (_task.kod_obj != 0 || !etNewTaskStreet.isEnabled) "" else etNewTaskStreet.text.toString()
                nd = if (_task.kod_obj != 0 || !etNewTaskNd.isEnabled) "" else etNewTaskNd.text.toString()
                house = when {
                    _task.kod_obj != 0 || !etNewTaskHouse.isEnabled -> "0"
                    etNewTaskHouse.text.toString()
                        .isNotEmpty() -> etNewTaskHouse.text.toString()
                    else -> "0"
                }
            }

            val res = dbWrite.insertNewTask(_task, _idInspector)
            if (!res) {
                Toast.makeText(
                    this@TaskActivity,
                    "Не удалось записать задачу, попробуйте ещё раз.",
                    Toast.LENGTH_LONG
                )
                    .show()
                setResult(RESULT_CANCELED)
                return false
            }

            _idTask = minIdTaskLocal
            textViewIdTask.text = _task.id_task.toString()

            val pref = dbRead.getPrefAct(_idInspector)
            val acts = dbRead.getActNamesList(_task.purpose)
            val universalActShablon = acts.first { it.id_act == 26 }.name


            acts.forEach {
                // Добавляем шаблон для акта типа id_act
                val fields = ActFieldsInfo(
                    id_act = it.id_act,
                    id_task = _task.id_task,
                    dat = _task.dat,
                    num_act = "$pref-${_task.id_task}-${it.id_act}",
                    adr_org = _task.address,
                    city = _task.city,
                    purpose_text = _task.purpose_name,
                    fio_contact = _task.fio_contact,
                    tel_contact = _task.tel_contact,
                    fio_eso = _task.fio,
                    shablon = if (it.tip == 1 || it.tip == 13) "${universalActShablon}.html" else "${it.name}.html"
                )

                dbWrite.insertActsFieldsShablon(fields)
            }

            // Добавляем шаблон для акта типа 27
            val actFields27 = ActFieldsInfo(
                id_task = _task.id_task,
                id_act = 27,
                num_act = "$pref-${_task.id_task}-27",
                dat = _task.dat
            )

            dbWrite.insertActsFieldsShablon(actFields27)

            dbWrite.close()
            dbRead.close()
            setResult(RESULT_ADD_TASK)
            return true
        } catch (e: java.lang.Exception) {
            println("$TAG_ERR on add TaskActivity: ${e.message}")
            dbWrite.close()
            dbRead.close()
            setResult(RESULT_CANCELED)
            return false
        }
    }

    // Update полей задачи
    // ---------------------------------
    private fun updateExistTaskLocal(): Boolean {
        val dbWrite = DbHandlerLocalWrite(this@TaskActivity, null)
        try {
            _task.apply {
                purpose = spinnerPurpose.selectedItemPosition + 1
                purpose_name = spinnerPurpose.selectedItem.toString()
                prim = etTaskPrim.text.toString()
                fio_contact = etTaskFioContact.text.toString()
                tel_contact = etTaskTelContact.text.toString()
                is_send = 0
            }

            if (_task.id_task < 0 && _task.status in arrayOf(0, -12)) {
                _task.apply {
                    address = editTextAddress.text.toString()
                    fio_contact = etTaskFioContact.text.toString()
                    tel_contact = etTaskTelContact.text.toString()
                    city = if (_task.kod_obj != 0 || !etNewTaskCity.isEnabled) "" else etNewTaskCity.text.toString()
                    street =
                        if (_task.kod_obj != 0 || !etNewTaskStreet.isEnabled) "" else etNewTaskStreet.text.toString()
                    nd = if (_task.kod_obj != 0 || !etNewTaskNd.isEnabled) "" else etNewTaskNd.text.toString()
                    house = when {
                        _task.kod_obj != 0 || !etNewTaskHouse.isEnabled -> "0"
                        etNewTaskHouse.text.toString()
                            .isNotEmpty() -> etNewTaskHouse.text.toString()
                        else -> "0"
                    }
                }

                //todo обновить все шаблоны?
                val actFields = ActFieldsInfo(
                    id_act = 26,
                    id_task = _task.id_task,
                    dat = _task.dat,
                    adr_org = _task.address,
                    fio_contact = _task.fio_contact,
                    tel_contact = _task.tel_contact,
                    purpose_text = _task.purpose_name,
                    fio_eso = _task.fio,
                    kod_dog = _task.kod_dog,
                    kod_obj = _task.kod_obj,
                    kodp = _task.kodp,
                    payer_name = _task.payer_name
                )

                dbWrite.updateActFields(actFields, fromServer = false)
            }

            return if (dbWrite.updateTask(_task)) {
                dbWrite.close()
                setResult(RESULT_OK)
                Toast.makeText(this, "Сохранено.", Toast.LENGTH_LONG).show()
                true
            } else {
                dbWrite.close()
                false
            }
        } catch (e: java.lang.Exception) {
            println("$TAG_ERR on update TaskActivity: ${e.message}")
            dbWrite.close()
            return false
        }
    }

    // Слушатель на кнопку "Задание выполнено"
    // ---------------------------------------
    private fun setListenerTaskDone() {
        btnTaskDone.setOnClickListener {
            val builder = android.app.AlertDialog.Builder(this)
            builder.setTitle("Внимание!")
                .setMessage("Подтвердить выполнение задачи?")
                .setIcon(R.drawable.ic_question)
                .setNegativeButton("Отмена") { dialog, _ ->
                    dialog.cancel()
                }
                .setPositiveButton("Да") { _, _ ->
                    val dbWritable = DbHandlerLocalWrite(this, null)
                    try {
                        if (dbWritable.updateTaskStatus(_task.id_task, if (_task.status == 0) -12 else 12)) {
                            findViewById<TextView>(R.id.tvTaskStatus).text = "Выполнен"
                            imgStatus.visibility = View.VISIBLE
                            imgStatus.setImageResource(R.drawable.ic_done_green)
                            textViewIdTask.setBackgroundResource(R.color.colorLightGreen)
                            setEditable(false)
                            setResult(Activity.RESULT_OK)
                        } else {
                            Toast.makeText(
                                this@TaskActivity,
                                "Произошла ошибка при обновлении статуса задачи.",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                        dbWritable.close()
                    } catch (e: java.lang.Exception) {
                        dbWritable.close()
                        println("$TAG_ERR on add TaskActivity: ${e.message}")
                    }
                }
            builder.show()
        }
    }

    override fun onResume() {
        super.onResume()
    }

    // Выбор значения в контекстном меню
    // -----------------------------------------------------------
    override fun onContextItemSelected(item: MenuItem?): Boolean {
        //Get Title Of Selected Item
        // val selectedItemTitle = item.title
        //To get Name of Person Click on ListView
        //val info = item.menuInfo as AdapterView.AdapterContextMenuInfo
        //return super.onOptionsItemSelected(item
        try {
            when (item!!.groupId) {
                // Открепить фото от задачи
                // ------------------------
                UNPIN_PHOTO -> {
                    val builder = android.app.AlertDialog.Builder(this)
                    builder.setTitle("Внимание!")
                        .setMessage("Открепить (удалить) фото от задачи?")
                        .setIcon(R.drawable.ic_question)
                        .setNegativeButton("Нет") { dialog, _ ->
                            dialog.cancel()
                        }
                        .setPositiveButton("Да") { _, _ ->
                            val dbWrite = DbHandlerLocalWrite(this@TaskActivity, null)
                            val idFile = recyclerViewPhoto.adapter!!.getItemId(item.itemId).toInt()
                            if (dbWrite.deleteFilesFromTask(_idTask, idFile))
                                _taskPhotos.removeIf { it.id_file == idFile && it.id_task == _idTask }
                            else
                                Toast.makeText(
                                    this,
                                    "Произошла ошибка. Не удалось открепить фотографию.",
                                    Toast.LENGTH_LONG
                                )
                            if (recyclerViewPhoto.adapter != null) {
                                recyclerViewPhoto.adapter = AdapterImageGallery(_taskPhotos, history = false)
                                (recyclerViewPhoto.adapter as AdapterImageGallery).notifyDataSetChanged()
                            }
                            dbWrite.close()
                        }
                    builder.show()
                }

                // Открепить акт от задачи
                // -----------------------
                UNPIN_ACT -> {
                    val builder = android.app.AlertDialog.Builder(this)
                    builder.setTitle("Внимание!")
                        .setMessage("Открепить (удалить) акт от задачи?")
                        .setIcon(R.drawable.ic_question)
                        .setNegativeButton("Нет") { dialog, _ ->
                            dialog.cancel()
                        }
                        .setPositiveButton("Да") { _, _ ->

                            val dbWrite = DbHandlerLocalWrite(this@TaskActivity, null)
                            if (dbWrite.deleteFilesFromTask(_idTask, item.itemId)) {
                                _taskActs.removeIf { it.id_file == item.itemId && it.id_task == _idTask }
                            } else {
                                Toast.makeText(this, "Произошла ошибка. Не удалось открепить акт. ", Toast.LENGTH_LONG)
                            }

                            if (_taskActs.size == 0) {
                                lvActs.visibility = View.GONE
                            } else {
                                lvActs.visibility = View.VISIBLE
                                lvActs.adapter = AdapterListActsWithPhotos(this@TaskActivity, _taskActs)
                                (lvActs.adapter as AdapterListActsWithPhotos).onItemClick = {
                                    if (!it.filename.takeLast(4).contains(".pdf", true))
                                        openPhoto(it)
                                }
                                (lvActs.adapter as AdapterListActsWithPhotos).notifyDataSetChanged()
                            }
                            dbWrite.close()

                        }
                    builder.show()
                }

                // Поделиться pdf-кой по стороннему приложению
                // -------------------------------------------
                SHARE_PDF -> {
                    val act = _taskActs.first { it.id_file == item.itemId }

                    val pdfUri = if (act.paper == 1) act.uri!! else
                        FileProvider.getUriForFile(this, this.packageName + ".provider", File(act.uri.toString()))

                    val sendIntent = Intent()
                    sendIntent.action = Intent.ACTION_SEND
                    sendIntent.data = Uri.parse("mailto:")
                    sendIntent.type = if (act.paper == 1) "image/*" else "application/pdf"
                    sendIntent.putExtra(Intent.EXTRA_STREAM, pdfUri)
                    sendIntent.putExtra(
                        Intent.EXTRA_SUBJECT, "Акт ${
                            act.filename.substringAfter("Акт").replace("_", " ")
                                .replace(".pdf", "", true)
                        } к посещению" +
                                " ${_task.dat!!.format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))}"
                    )
                    sendIntent.putExtra(Intent.EXTRA_EMAIL, arrayOf(_task.email_podp))
                    sendIntent.putExtra(Intent.EXTRA_PHONE_NUMBER, _task.tel_podp)
                    sendIntent.putExtra(
                        Intent.EXTRA_TEXT, "Посещение по адресу " +
                                _task.address + ", абонент: " + _task.payer_name + ", дата: " +
                                _task.dat!!.format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))
                    )

                    startActivity(Intent.createChooser(sendIntent, "Поделиться"))
                }

                // Поделиться фоткой по стороннему приложению
                // -------------------------------------------
                SHARE_IMG -> {
                    val idFile = recyclerViewPhoto.adapter!!.getItemId(item.itemId).toInt()
                    val photo = _taskPhotos.first { it.id_file == idFile }
                    val dbWrite = DbHandlerLocalWrite(this@TaskActivity, null)

                    if (photo.uri == null) {
                        try {
                            val p = downloadJpg(this@TaskActivity, photo.filedata!!, photo.filename, photo.id_task)
                            photo.uri = p.toUri()
                            dbWrite.updateFileUri(photo)
                            dbWrite.close()
                        } catch (e: Exception) {
                            println("$TAG_ERR share downloadJpg: ${e.message}")
                            dbWrite.close()
                        }
                    }

                    val sendIntent = Intent()
                    sendIntent.action = Intent.ACTION_SEND
                    sendIntent.data = Uri.parse("mailto:")
                    sendIntent.type = "image/*"
                    sendIntent.putExtra(Intent.EXTRA_STREAM, photo.uri!!)
                    sendIntent.putExtra(
                        Intent.EXTRA_SUBJECT, "Фотография к посещению" +
                                " ${_task.dat!!.format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))}"
                    )
                    sendIntent.putExtra(Intent.EXTRA_EMAIL, arrayOf(_task.email_podp))
                    sendIntent.putExtra(Intent.EXTRA_PHONE_NUMBER, _task.tel_podp)
                    sendIntent.putExtra(
                        Intent.EXTRA_TEXT, "Посещение по адресу " +
                                _task.address + ", абонент: " + _task.payer_name + ", дата: " +
                                _task.dat!!.format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))
                    )

                    startActivity(Intent.createChooser(sendIntent, "Поделиться"))
                }
            }
        } catch (e: Exception) {
            println("$TAG_ERR onContextItemSelected: ${e.message}")
        }
        return true
    }

    // Вызывается после возвращения из вызванных активити
    // ------------------------------------------------------------------------------
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode == RESULT_OK) {
            when (requestCode) {
                // После выбора фотографии из галереи
                // ----------------------------------
                PHOTO_TO_ACT,
                PICK_IMAGE_REQUEST -> {
                    if (data!!.clipData == null && data.data == null) {
                        Toast.makeText(this, "Не удалось прикрепить фотографию.", Toast.LENGTH_LONG)
                            .show()
                        return
                    }

                    if (data.clipData != null) {
                        val count = data.clipData!!.itemCount
                        // Несколько фотографий
                        // -----------------------
                        for (i in 0 until count) {
                            val imageUri: Uri =
                                getCapturedImage(data.clipData!!.getItemAt(i).uri) ?: data.clipData!!.getItemAt(i).uri
                            if (requestCode == PHOTO_TO_ACT) {
                                // Если прикрепление фото к акту, то получаем id file акта, чтобы узнать id act и npp
                                // ----------------------------------------------------------------------------------
                                insertPhotoFromDeviceToLocalBD(
                                    imageUri,
                                    _actForAttach.id_act,
                                    _actForAttach.npp,
                                    _actForAttach.num_act
                                )
                            } else {
                                // Прикрепление фото к задаче
                                // --------------------------
                                insertPhotoFromDeviceToLocalBD(imageUri)
                            }
                        }
                    } else if (data.data != null) {
                        val imageUri = getCapturedImage(data.data!!) ?: data.data!!
                        if (requestCode == PHOTO_TO_ACT) {
                            // Если прикрепление фото к акту, то получаем id file акта, чтобы узнать id act и npp
                            // ----------------------------------------------------------------------------------
                            insertPhotoFromDeviceToLocalBD(
                                imageUri,
                                _actForAttach.id_act,
                                _actForAttach.npp,
                                _actForAttach.num_act
                            )
                        } else {
                            // Прикрепление фото к задаче
                            // --------------------------
                            insertPhotoFromDeviceToLocalBD(imageUri)
                        }
                    }
                }

                // После снимка фотокамеры
                // -----------------------
                CAMERA_TO_ACT,
                CAMERA_REQUEST -> {
                    val name = getFileNameFromUri(_uriFromCamera)
                    _uriFromCamera = try {
                        getCapturedImage(_uriFromCamera) ?: _uriFromCamera
                    } catch (e: Exception) {
                        println("$TAG_ERR  Could not get EXIF info for file $name ${e.message} ")
                        _uriFromCamera
                    }

                    try {
                        if (requestCode == CAMERA_TO_ACT) {
                            // Прикрепление снимка к акту задачи
                            // ---------------------------------
                            insertPhotoFromDeviceToLocalBD(
                                _uriFromCamera,
                                _actForAttach.id_act,
                                _actForAttach.npp,
                                _actForAttach.num_act
                            )
                        } else {
                            // Прикрепление снимка к задаче
                            // ----------------------------
                            insertPhotoFromDeviceToLocalBD(_uriFromCamera)
                        }
                    } catch (e: Exception) {
                        Toast.makeText(
                            this@TaskActivity, "$TAG_ERR ins photo ${e.message}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }

                // Прикрепление бумажного акта
                // ---------------------------
                PAPER_TO_ACT,
                PICK_PAPER_REQUEST -> {
                    /* var name = ""

                     if (_actForAttach.id_act != 0 && _actForAttach.npp != 0) {
                         val act = _acts.firstOrNull { it.id_act == _actForAttach.id_act }
                         name = if (_actForAttach.id_act != 0 && _actForAttach.npp != 0 && act != null)
                             if (act.name.isNotEmpty()) act.name.replace(" ", "_") else "Акт" else "Акт"
                         name += "-${_actForAttach.num_act.replace("\\", "-")}.jpg"
                     }*/

                    val name = if (_actForAttach.num_act.isNotEmpty()) "${
                        _actForAttach.num_act.replace(
                            "\\",
                            "-"
                        )
                    }_${_acts.first { it.id_act == _actForAttach.id_act }.name.replace(" ", "_")}.jpg"
                    else ""

                    val act = FileInfo(
                        id_task = _idTask,
                        is_signed = 0,
                        is_send = 0,
                        id_file = 0,
                        paper = 1,
                        id_act = _actForAttach.id_act,
                        npp = _actForAttach.npp,
                        date_send_to_client = null,
                        email_client = "",
                        filename = name
                    )

                    if (data!!.clipData == null && data.data == null) {
                        Toast.makeText(this, "Не удалось прикрепить акт", Toast.LENGTH_LONG)
                            .show()
                        return
                    }
                }
            }

            // Настройка видимости и заполнение
            // галереи прикреплённых фотографий
            // --------------------------------
            if (_idTask != ID_NEW_TASK) {
                loadAttachments()
            }
            // Если вернулись из создания акта, то надо
            // отобразить созданный pdf в карточке задания
            // -------------------------------------------
            if (requestCode == CREATE_ACT && lvActs.adapter != null) {
                (lvActs.adapter as AdapterListActsWithPhotos).notifyDataSetChanged()
            }
        }
    }

    // Получить реальный путь к фотографии по Uri
    // --------------------------------------------------------
    private fun getRealPathFromUri(contentUri: Uri?): String? {
        var cursor: Cursor? = null
        return try {
            val proj = arrayOf(MediaStore.Images.Media.DATA)
            cursor = this.contentResolver.query(contentUri!!, proj, null, null, null)
            val columnIndex = cursor!!.getColumnIndexOrThrow(MediaStore.Images.Media.DATA)
            cursor.moveToFirst()
            cursor.getString(columnIndex)
        } finally {
            cursor?.close()
        }
    }

    // Поворот фотографии
    // --------------------------------------------------------
    @RequiresApi(Build.VERSION_CODES.P)
    private fun getCapturedImage(selectedPhotoUri: Uri): Uri? {
        try {
            val rotatedBitmap: Bitmap?
            val bitmap = when {
                Build.VERSION.SDK_INT < Build.VERSION_CODES.P -> MediaStore.Images.Media.getBitmap(
                    this.contentResolver,
                    selectedPhotoUri
                )
                else -> {
                    val source = ImageDecoder.createSource(this.contentResolver, selectedPhotoUri)
                    ImageDecoder.decodeBitmap(source)
                }
            }

            // Узнаём угол поворота файла
            try {
                val ei = try {
                    ExifInterface(getRealPathFromUri(selectedPhotoUri)!!)
                } catch (e: Exception) {
                    null
                }
                /* rotatedBitmap = if (bitmap.height > bitmap.width)
                     rotateImage(bitmap, 90)
                 else bitmap*/
                if (ei != null) {
                    val orientation = ei.getAttributeInt(
                        ExifInterface.TAG_ORIENTATION,
                        ExifInterface.ORIENTATION_UNDEFINED
                    )

                    rotatedBitmap = if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
                        when (orientation) {
                            ExifInterface.ORIENTATION_ROTATE_90 -> rotateImage(bitmap, 90)
                            ExifInterface.ORIENTATION_ROTATE_180 -> rotateImage(bitmap, 180)
                            ExifInterface.ORIENTATION_ROTATE_270 -> rotateImage(bitmap, 270)
                            ExifInterface.ORIENTATION_NORMAL -> bitmap
                            else -> rotateImage(bitmap, -90)
                        }
                    } else {
                        bitmap
                    }
                } else {
                    rotatedBitmap = bitmap
                }

                // Создаём нормально повёрнутый файл
                return if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
                    getImageUri(
                        Bitmap.createBitmap(
                            rotatedBitmap!!,
                            0,
                            0,
                            rotatedBitmap.width,
                            rotatedBitmap.height,
                            Matrix().apply {},
                            true
                        ), getFileNameFromUri(selectedPhotoUri)
                    )
                } else {
                    getImageUri(rotatedBitmap!!, getFileNameFromUri(selectedPhotoUri))
                }
            } catch (e: Exception) {
                println("$TAG_ERR getCapturedImage ExifInterface ${e.message}")
                return null
            }
        } catch (e: Exception) {
            println("$TAG_ERR getCapturedImage ${e.message}")
            return null
        }
    }

    private fun rotateImage(bitmap: Bitmap, angle: Int): Bitmap? {
        val matrix = Matrix()
        matrix.postRotate(angle.toFloat(), ((bitmap.width) / 2).toFloat(), ((bitmap.height) / 2).toFloat())

        return Bitmap.createBitmap(
            bitmap, 0, 0, bitmap.width, bitmap.height,
            matrix, true
        )
    }

    // Getting image Uri from the bitmap, its needed for android level 6 (sdk 23)
    // --------------------------------------------------------------------------
    private fun getImageUri(inImage: Bitmap, title: String): Uri? {
        return try {
            /* val outImage: Bitmap = if (inImage.width > inImage.height) {
              Bitmap.createScaledBitmap(inImage, inImage.width, inImage.height, true)
          } else {
              Bitmap.createScaledBitmap(inImage, inImage.height, inImage.width, true)
          }*/
            val path = MediaStore.Images.Media.insertImage(this.contentResolver, inImage, title, null)
            Uri.parse(path)
        } catch (e: Exception) {
            println("$TAG_ERR getImageUri ${e.message}")
            null
        }
    }

    // Получить имя файла по uri
    // -----------------------------------------------
    private fun getFileNameFromUri(uri: Uri): String {
        var result = ""
        var cursor: Cursor? = null
        try {
            if (uri.scheme == "content") {
                cursor = contentResolver.query(uri, null, null, null, null)
                if (cursor != null && cursor.moveToFirst()) {
                    result = cursor.getString(cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME))
                }

            }
        } finally {
            cursor!!.close()
        }
        if (result.isEmpty()) {
            result = uri.path ?: ""
            result = result.substringAfterLast("/")
        }
        return result
    }


    // Сохранение фото с памяти устройства в лок базу приложения
    // -----------------------------------------------------------------
    private fun insertPhotoFromDeviceToLocalBD(imageUri: Uri): Boolean {
        return insertPhotoFromDeviceToLocalBD(imageUri, 0, 0, "")
    }

    private fun insertPhotoFromDeviceToLocalBD(imageUri: Uri, idAct: Int, npp: Int, numAct: String): Boolean {
        try {
            if (idAct == 0 && npp == 0)
                if (_taskPhotos.find { it.uri == imageUri } != null) {
                    Toast.makeText(this, "Данная фотография уже прикреплена к заданию.", Toast.LENGTH_LONG)
                        .show()
                    return false
                }

            val name = if (numAct.isNotEmpty()) "${
                numAct.replace(
                    "\\",
                    "-"
                )
            }_${_acts.first { it.id_act == idAct }.name.replace(" ", "_")}_"
            else "${_idTask}_"

            val filedata: ByteArray? = blobFromUri(this, imageUri)
            val fileName = "${name}photo_${
                LocalDateTime.now().format(
                    DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss")
                )
            }.jpg"

            val file = FileInfo(
                id_task = _idTask,
                filename = fileName,
                filedata = filedata,
                uri = imageUri,
                is_signed = 0,
                is_send = 0,
                id_file = 0,
                paper = 0,
                date_send_to_client = null,
                email_client = "",
                id_act = idAct,
                npp = npp
            )

            val dbWrite = DbHandlerLocalWrite(this, null)
            val idFile = dbWrite.insertFileWithBlob(file, isImage = true)
            dbWrite.close()
            if (idFile != -1) {
                file.id_file = idFile
                _taskPhotos.add(file)
                loadAttachments()
            } else
                Toast.makeText(
                    this@TaskActivity,
                    "Не удалось сохранить фотографию в базу данных.", Toast.LENGTH_LONG
                )
            return true
        } catch (e: java.lang.Exception) {
            println("$TAG_ERR insert photo to local: ${e.message}")
            return false
        }
    }

    // Сохранение фото акта с памяти устройства в лок базу приложения
    // --------------------------------------------------------------------------
    private fun insertPaperActToLocalDB(fileUri: Uri, signed: Int = 0): Boolean {
        return insertPaperActToLocalDB(fileUri, signed, 0, 0, "")
    }

    private fun insertPaperActToLocalDB(fileUri: Uri, signed: Int, idAct: Int, npp: Int, numAct: String): Boolean {
        val dbRead = DbHandlerLocalRead(this@TaskActivity, null)
        val dbWrite = DbHandlerLocalWrite(this@TaskActivity, null)
        try {
            val actShablon = dbRead.getActFieldsShablon(_idTask, 27)
            actShablon.num_act += "-" + (_taskActs.size + 1)//"\\$npp"
            actShablon.npp = dbRead.getLastActNpp(_idTask, 27) + 1

            val name = if (numAct.isNotEmpty()) "${
                numAct.replace(
                    "\\",
                    "-"
                )
            }_${_acts.first { it.id_act == idAct }.name.replace(" ", "_")}-${actShablon.npp}.jpg"
            else "${actShablon.num_act.replace("\\", "-")}-Акт-${actShablon.npp}.jpg"

            val filedata: ByteArray? = blobFromUri(this, fileUri)

            val file = FileInfo(
                id_task = _idTask,
                filename = name,
                filedata = filedata,
                uri = fileUri,
                is_signed = signed,
                is_send = 0,
                id_file = 0,
                paper = 1,
                date_send_to_client = null,
                email_client = "",
                id_act = idAct,
                npp = npp
            )

            val idFile = dbWrite.insertFileWithBlob(file, isImage = true)
            if (idFile != -1) {
                file.id_file = idFile
                actShablon.id_file = idFile

                dbWrite.insertActFields(actShablon)
                _taskPhotos.add(file)

                if (lvActs.adapter != null)
                    (lvActs.adapter as AdapterListActsWithPhotos).notifyDataSetChanged()
            } else {
                Toast.makeText(
                    this@TaskActivity,
                    "Не удалось сохранить бумажный акт в базу данных.", Toast.LENGTH_LONG
                )
            }
            dbRead.close()
            dbWrite.close()
            return true
        } catch (e: java.lang.Exception) {
            println("$TAG_ERR insert photo act to local: ${e.message}")
            dbRead.close()
            dbWrite.close()
            return false
        }
    }

    // Подключение меню
    // ----------------------------------------------------
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        val inflater = menuInflater
        inflater.inflate(R.menu.toolbar_menu_route_task, menu)

        // Акты
        // --------------------------------------------------
        menu.getItem(0).isEnabled = _idTask != ID_NEW_TASK

        // Информация по договору доступная если есть kod_obj
        // --------------------------------------------------
        menu.getItem(1).isEnabled = _idTask != ID_NEW_TASK && _task.kod_obj != 0

        // История посещений и Zulu будут доступны, если задача создана не вручную.
        // Если задача создана вручную И подобран объект из асусэ, то меню откроется после того как будет получена
        // информация по договору с сервера (refreshDataServer).
        // -----------------------------------------------------------------------
        menu.getItem(2).isEnabled = _idTask != ID_NEW_TASK && _task.status !in arrayOf(0, -12, 15)
        menu.getItem(3).isEnabled = _idTask != ID_NEW_TASK && _task.status !in arrayOf(0, -12, 15)
        menu.getItem(4).isEnabled = _idTask != ID_NEW_TASK

        return super.onCreateOptionsMenu(menu)
    }

    // Выбор значения из меню
    // ----------------------------------------------------------
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            // формирование первичных документов
            // ---------------------------------
            R.id.menu_issuance_docs -> {
                if (!btnSaveTask.isEnabled) {
                    item.isEnabled = false
                    Toast.makeText(this, "Недоступно", Toast.LENGTH_LONG).show()
                    return true
                }

//                try {
//                    dlgCreateAct = DlgListCreateActs(_acts, _task)
//                    dlgCreateAct!!.show(supportFragmentManager, "LIST_CREATE_ACT")
//
//                } catch (e: Exception) {
//                    println("$TAG_ERR task dialog acts: ${e.message}")
//                }
//                return true
            }
            // История посещений
            // -------------------------
            R.id.menu_history_route -> {
                val intent = Intent(this@TaskActivity, ListHistoryObjectActivity::class.java)
                intent.putExtra("TASK_ID", _idTask)
                intent.putExtra("KOD_OBJ", _task.kod_obj)
                intent.putExtra("NDOG", _task.ndog)
                intent.putExtra("ADDRESS", _task.address)

                this.startActivity(intent)
                return true
            }

            // Zulu
            // ----------------
            R.id.menu_zulu -> {
                if (_task.lan.isEmpty() && _task.lat.isEmpty()) {
                    Toast.makeText(this, "Отсутствуют координаты объекта.", Toast.LENGTH_LONG).show()
                } else {
                    val str =
                        "http://10.7.1.8:6473/zuluweb/#!/map/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx?lon=${_task.lan}&lat=${_task.lat}&z=18"

                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(str))
                    startActivity(intent)
                }

                /* val intent = Intent(this@TaskActivity, ZuluActivity::class.java)
                 intent.putExtra("TASK_ID", _idTask)
                 intent.putExtra("TASK", _task)
                 intent.putExtra("ID_INSPECTOR", _idInspector)
                 this.startActivity(intent)*/
                return true
            }
            // Поделиться вложениями
            // ----------------
            R.id.menu_share_all -> {
                val arrUris: ArrayList<Uri> = ArrayList()
                val dbWrite = DbHandlerLocalWrite(this, null)
                _taskActs.forEach {
                    if (it.uri != null) {
                        try {
                            if (it.paper == 1) {
                                arrUris.add(it.uri!!)
                            } else {
                                val path = FileProvider.getUriForFile(
                                    Objects.requireNonNull(this@TaskActivity),
                                    BuildConfig.APPLICATION_ID + ".provider", File(it.uri!!.toString())
                                )

                                arrUris.add(path)
                            }
                        } catch (e: Exception) {
                            println("$TAG_ERR share create pdf uri: ${e.message}")
                        }
                    } else {
                        try {
                            val p = downloadPdf(this@TaskActivity, it.filedata!!, it.filename, it.id_task)
                            it.uri = p.toUri()
                            arrUris.add(it.uri!!)
                            dbWrite.updateFileUri(it)
                        } catch (e: Exception) {
                            println("$TAG_ERR share downloadPdf: ${e.message}")
                        }
                    }
                }

                _taskPhotos.forEach {
                    if (it.uri != null) {
                        try {
                            arrUris.add(it.uri!!)
                        } catch (e: Exception) {
                            println("$TAG_ERR share create img uri: ${e.message}")
                        }
                    } else {
                        try {
                            val p = downloadJpg(this@TaskActivity, it.filedata!!, it.filename, it.id_task)
                            it.uri = p.toUri()
                            arrUris.add(it.uri!!)
                            dbWrite.updateFileUri(it)
                        } catch (e: Exception) {
                            println("$TAG_ERR share downloadJpg: ${e.message}")
                        }
                    }
                }

                dbWrite.close()

                try {
                    val sendIntent = Intent()
                    sendIntent.action = Intent.ACTION_SEND_MULTIPLE
                    sendIntent.data = Uri.parse("mailto:")
                    sendIntent.type = "application/*"
                    sendIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    sendIntent.putParcelableArrayListExtra(Intent.EXTRA_STREAM, arrUris)
                    sendIntent.putExtra(
                        Intent.EXTRA_SUBJECT, "Вложения к посещению" +
                                " ${_task.dat!!.format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))}" +
                                " ${_task.payer_name}"
                    )
                    sendIntent.putExtra(Intent.EXTRA_EMAIL, arrayOf(_task.email_podp))
                    sendIntent.putExtra(Intent.EXTRA_PHONE_NUMBER, _task.tel_podp)
                    sendIntent.putExtra(
                        Intent.EXTRA_TEXT, "Вложения к посещению по адресу " +
                                _task.address + ", абонент: " + _task.payer_name + ", дата: " +
                                _task.dat!!.format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))
                    )
                    startActivity(Intent.createChooser(sendIntent, "Поделиться"))
                } catch (e: Exception) {
                    println("$TAG_ERR sendIntent: ${e.message}")
                }

                return true
            }
            // exit
            // -----------
            R.id.home -> {
                onBackPressed()
            }
        }

        return super.onOptionsItemSelected(item)
    }

    override fun onSupportNavigateUp(): Boolean {
        this.finish()
        return true
    }

    // При нажатии кнопки назад спрашиваем подтверждение
    // -------------------------------------------------
    override fun onBackPressed() {
        if (!btnSaveTask.isEnabled) {
            setResult(Activity.RESULT_OK)
            this@TaskActivity.finish()
        } else
            if (btnSaveTask.isEnabled) {
                val msg =
                    if (_idTask == ID_NEW_TASK) "Покинуть создание задачи?\n(все введённые данные будут утеряны)"
                    else "Покинуть редактирование задачи?"
                val builder = android.app.AlertDialog.Builder(this)
                builder.setTitle("Внимание!")
                    .setMessage(msg)
                    .setIcon(R.drawable.ic_question)
                    .setNegativeButton("Нет") { dialog, _ ->
                        dialog.cancel()
                    }
                    .setPositiveButton("Да") { _, _ ->
                        setResult(RESULT_CANCELED)
                        this@TaskActivity.finish()
                    }
                builder.show()
            } else {
                setResult(RESULT_OK)
                this@TaskActivity.finish()
            }
    }

    // Список целей для spinner
    // ------------------------------------------
    private fun getListPurpose(): Array<String> {
        val dbRead = DbHandlerLocalRead(this, null)
        val res = dbRead.getPurposeList().toTypedArray()
        dbRead.close()
        return res
    }

    // После прикрепления бумажного акта
    // ----------------------------------------------
    override fun onCancel(dialog: DialogInterface?) {
        // Если был закончен вызов диалога добавления бумажного акта
        // ---------------------------------------------------------
        try {


        } catch (e: Exception) {
            println("$TAG_ERR on cancel dlgPaperAct: ${e.message}")
        }
        // Если был закончен вызов диалога выбора нового\ редактирования акта
        // ------------------------------------------------------------------
//        try {
//            if (dlgCreateAct?.onCancel == true) {
//                val dlgCreateOrEditAct = DlgCreateOrEditAct(dlgCreateAct!!.ACT_LIST, dlgCreateAct!!.ACT, _task)
//                dlgCreateOrEditAct.show(supportFragmentManager, "CREATE_OR_EDIT_ACT")
//                if (lvActs.adapter != null)
//                    (lvActs.adapter as AdapterListActsWithPhotos).notifyDataSetChanged()
//                dlgCreateAct = null
//            }
//        } catch (e: Exception) {
//            println("$TAG_ERR on cancel dlgCreateAct: ${e.message}")
//        }
    }
}