package ru.infoenergo.mis.adapters

import android.content.Context
import android.net.Uri
import android.view.ContextMenu
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.CheckBox
import android.widget.ImageView
import android.widget.TextView
import ru.infoenergo.mis.R
import ru.infoenergo.mis.dbhandler.DbHandlerLocalWrite
import ru.infoenergo.mis.helpers.*
import java.util.*


/** ********************************************************** **/
/**     Адаптер для  списка актов, прикреплённых к задаче      **/
/** ********************************************************** **/

class AdapterListTasksActs() : BaseAdapter(), View.OnCreateContextMenuListener {
    private lateinit var context: Context
    private var actList: ArrayList<FileInfo> = ArrayList()
    private lateinit var inflater: LayoutInflater

    var onItemClick: ((FileInfo) -> Unit)? = { }

    constructor(pContext: Context, pActList: ArrayList<FileInfo>) : this() {
        context = pContext
        actList = pActList
        inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
    }

    override fun getCount(): Int {
        return actList.size
    }

    override fun getItem(position: Int): FileInfo {
        return actList[position]
    }

    override fun getItemId(position: Int): Long {
        return actList[position].id_file.toLong()
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
        var viewHolder = ActViewHolder()
        var view = convertView

        if (convertView == null) {

            view = inflater.inflate(R.layout.lvitem_task_acts, parent, false)
            viewHolder.icon = view.findViewById(R.id.imgTaskActIcon) as ImageView
            viewHolder.name = view.findViewById(R.id.tvTaskActName) as TextView
            viewHolder.signed = view.findViewById(R.id.chkBoxTaskActSigned) as CheckBox
            viewHolder.paper = view.findViewById(R.id.chkBoxTaskActPaper) as CheckBox

            view.tag = viewHolder
        } else {
            viewHolder = convertView.tag as ActViewHolder
        }

        val item = getItem(position)

        viewHolder.icon?.apply {
            if (item.paper == 1 || !item.filename.takeLast(4).contains(".pdf")) {
                setBackgroundResource(R.drawable.ic_photo_library)
            } else {
                setBackgroundResource(R.drawable.ic_pdf_gray)
            }
        }

        viewHolder.id = item.id_file
        viewHolder.name!!.text = item.filename
        viewHolder.signed!!.isChecked = item.is_signed == 1
        viewHolder.paper!!.isChecked = item.paper == 1


        view?.setOnClickListener {
            try {
                // Если получится открыть акт по uri
                if (item.filename.takeLast(4).contains(".pdf", ignoreCase = true)) {
                    if (item.uri == null || item.uri!!.toString().isNotEmpty() && !showPdf(context, item.uri!!.toString())) {
                        // если нет, то скачать из бд filedata и сохранить файл на устройство и запоминаем его uri
                        val tmpPath =
                            downloadPdf(context, item.filedata!!, item.filename, actList[position].id_task)
                        if (tmpPath.isNotEmpty()) {
                            item.uri = Uri.parse(tmpPath)
                            DbHandlerLocalWrite(context, null).updateFileUri(item)
                        }
                        showPdf(context, tmpPath)
                    }
                } else {
                    onItemClick?.invoke(item)
                }
            } catch (e: Exception) {
                println("$TAG_ERR adapter acts: ${e.message}")
            }
        }

        view?.setOnCreateContextMenuListener(this)

        return view!!

    }

    // эти два метода решили проблему "перемешивания" элементов листвью
    override fun getViewTypeCount(): Int {
        return if (count == 0) super.getViewTypeCount() else count
    }

    // эти два метода решили проблему "перемешивания" элементов листвью
    override fun getItemViewType(position: Int): Int {
        return position
    }

    override fun onCreateContextMenu(menu: ContextMenu?, v: View?, menuInfo: ContextMenu.ContextMenuInfo?) {
        val idFile = (v!!.tag as ActViewHolder).id

        val signed = (v.tag as ActViewHolder).signed
        val paper = (v.tag as ActViewHolder).paper
        // Поделиться актом можно, только если он подписан
        // --------------------------------------------------------
        if (signed!!.isChecked)
            menu!!.add(SHARE_PDF, idFile, 0, "Поделиться")

        if (signed.isChecked && !paper!!.isChecked)
            return

        // Удалять акты можно, только если инспектор добавил их сам
        // --------------------------------------------------------
        if (idFile < 0)
            menu!!.add(UNPIN_ACT, idFile, if (signed.isChecked) 1 else 0, "Открепить акт")

    }

    class ActViewHolder {
        var id: Int = -1
        var icon: ImageView? = null
        var name: TextView? = null
        var signed: CheckBox? = null
        var paper: CheckBox? = null
    }
}