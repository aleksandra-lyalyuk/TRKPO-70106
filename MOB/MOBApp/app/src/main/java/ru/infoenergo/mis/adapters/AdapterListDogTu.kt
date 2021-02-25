package ru.infoenergo.mis.adapters

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import android.widget.TextView
import ru.infoenergo.mis.helpers.DogTu
import ru.infoenergo.mis.R
import java.text.DecimalFormat
import java.util.*

/** *********************************************** **/
/**   Адаптер для listview ТУ договора абонента     **/
/** *********************************************** **/
class AdapterListDogTu(
    private val context: Context,
    private val dataSource: ArrayList<DogTu>?
) : BaseAdapter() {

    private val inflater: LayoutInflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater

    override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
        var view = convertView
        var viewHolderDogTu: ViewHolderDogTu = ViewHolderDogTu()

        try {
            val item = getItem(position)

            // заполнение текствьюеров значениями из списка
            viewHolderDogTu.name?.text = item.name
            viewHolderDogTu.name_tarif?.text = item.name_tarif
            viewHolderDogTu.nomer?.text = item.nomer.toString()
            viewHolderDogTu.soq?.text = DecimalFormat("0.000").format(item.so_q)
            viewHolderDogTu.sog?.text = DecimalFormat("0.000").format(item.so_g)
            viewHolderDogTu.swq?.text = DecimalFormat("0.000").format(item.sw_q)
            viewHolderDogTu.swg?.text = DecimalFormat("0.000").format(item.sw_g)
            viewHolderDogTu.stq?.text = DecimalFormat("0.000").format(item.st_q)
            viewHolderDogTu.stg?.text = DecimalFormat("0.000").format(item.st_g)
            viewHolderDogTu.gwMax?.text = DecimalFormat("0.000").format(item.gw_qmax)
            viewHolderDogTu.gwQsr?.text = DecimalFormat("0.000").format(item.gw_qsr)

        } catch (e: Exception) {
            val r = e.message
        }
        return view!!
    }


    override fun getItem(position: Int): DogTu {
        return dataSource!![position]
    }

    override fun getItemId(position: Int): Long {
        return position.toLong()
    }

    override fun getCount(): Int {
        return dataSource!!.size
    }

    // эти два метода решили проблему "перемешивания" элементов листвью
    override fun getViewTypeCount(): Int {
        return if (count == 0) super.getViewTypeCount() else count
    }

    // эти два метода решили проблему "перемешивания" элементов листвью
    override fun getItemViewType(position: Int): Int {
        return position
    }

}

class ViewHolderDogTu(
    var nomer: TextView? = null,
    var name: TextView? = null,
    var name_tarif: TextView? = null,
    var soq: TextView? = null,
    var sog: TextView? = null,
    var swq: TextView? = null,
    var swg: TextView? = null,
    var stq: TextView? = null,
    var stg: TextView? = null,
    var gwMax: TextView? = null,
    var gwQsr: TextView? = null
)
